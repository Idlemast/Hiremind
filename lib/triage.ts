import { scoreToFit, fitToDecision, type Fit, type Decision } from "./thresholds";

export interface TriageInput {
  candidateSkills: string[];
  jobRequirements: string[];
  bonusKeywords?: string[];
}

export interface TriageResult {
  score: number;
  fit: Fit;
  decision: Decision;
  matchedSkills: string[];
  missingSkills: string[];
  why: string;
}

// Normalize a string for fuzzy comparison
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
}

// Returns true if two skill strings are semantically close enough
function skillsMatch(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;
  // One contains the other (e.g. "React" matches "React (Expert)")
  if (na.includes(nb) || nb.includes(na)) return true;
  // Share at least one significant word (≥4 chars)
  const wordsA = na.split(" ").filter((w) => w.length >= 4);
  const wordsB = new Set(nb.split(" ").filter((w) => w.length >= 4));
  return wordsA.some((w) => wordsB.has(w));
}

export function scoreCandidate(input: TriageInput): TriageResult {
  const { candidateSkills, jobRequirements, bonusKeywords = [] } = input;

  if (jobRequirements.length === 0) {
    return { score: 50, fit: "medium", decision: "review", matchedSkills: [], missingSkills: [], why: "No requirements defined for this role." };
  }

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const req of jobRequirements) {
    const matched = candidateSkills.some((skill) => skillsMatch(skill, req));
    if (matched) matchedSkills.push(req);
    else missingSkills.push(req);
  }

  // Base score: % of requirements covered
  const baseScore = Math.round((matchedSkills.length / jobRequirements.length) * 100);

  // Bonus: extra skills beyond requirements
  const bonusMatches = bonusKeywords.filter((kw) =>
    candidateSkills.some((skill) => skillsMatch(skill, kw))
  ).length;
  const bonus = Math.min(bonusMatches * 3, 10);

  // Depth bonus: candidates with more total skills get a small boost
  const depthBonus = Math.min(Math.floor(candidateSkills.length / 3), 5);

  const score = Math.min(baseScore + bonus + depthBonus, 100);

  const fit = scoreToFit(score);
  const decision = fitToDecision(fit);

  const why = buildWhy(score, fit, matchedSkills, missingSkills, candidateSkills);

  return { score, fit, decision, matchedSkills, missingSkills, why };
}

function buildWhy(
  score: number,
  fit: TriageResult["fit"],
  matched: string[],
  missing: string[],
  allSkills: string[]
): string {
  if (fit === "strong") {
    return `Strong alignment with ${matched.length} of ${matched.length + missing.length} core requirements (${score}% match). ${
      matched.slice(0, 3).join(", ")} are directly verified.${
      missing.length > 0 ? ` Minor gap on ${missing[0]}.` : " No significant gaps detected."
    }`;
  }
  if (fit === "medium") {
    return `Partial match at ${score}%. Covers ${matched.length} requirement${matched.length !== 1 ? "s" : ""} including ${
      matched[0] ?? "key areas"}, but missing ${missing.slice(0, 2).join(", ")}.${
      allSkills.length > 4 ? " Broad skill set may compensate." : ""
    }`;
  }
  return `Weak alignment (${score}%). Only ${matched.length} of ${matched.length + missing.length} requirements met. Missing: ${
    missing.slice(0, 3).join(", ")
  }. Not recommended for advancement without further evaluation.`;
}
