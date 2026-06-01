"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getEm, getJobById, getCandidateById } from "@/lib/db";
import { scoreCandidate, buildWhy } from "@/lib/triage";
import { scoreToFit } from "@/lib/thresholds";
import { analyzeInterviewNotes, notesScoreDelta } from "@/lib/interview-signals";
import { extractSkillsFromText, parseManualSkills, mergeSkills } from "@/lib/extract-skills";
import { Candidate } from "@/entities/index";

export async function importCandidate(formData: FormData) {
  const jobId    = Number(formData.get("jobId"));
  const name     = String(formData.get("name") ?? "").trim();
  const role     = String(formData.get("role") ?? "").trim();
  const company  = String(formData.get("company") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const email    = String(formData.get("email") ?? "").trim() || undefined;
  const salary   = String(formData.get("salary") ?? "").trim() || undefined;
  const source   = String(formData.get("source") ?? "Manual").trim();
  const cvText   = String(formData.get("cvText") ?? "");
  const rawSkills = String(formData.get("skills") ?? "");

  if (!name || !role || !company || !location || !jobId) {
    throw new Error("Champs obligatoires manquants");
  }

  const job = await getJobById(jobId);
  if (!job) throw new Error("Job introuvable");

  const manualSkills  = parseManualSkills(rawSkills);
  const extractedSkills = extractSkillsFromText(cvText);
  const skills = mergeSkills(manualSkills, extractedSkills);

  const requirements = (job.requirements as string[] | null) ?? [];
  const result = scoreCandidate({ candidateSkills: skills, jobRequirements: requirements });

  const em = await getEm();
  const candidate = em.create(Candidate, {
    name, role, company, location, email, salary, source,
    skills,
    fit:  result.fit,
    score: result.score,
    gaps:  result.missingSkills,
    why:   result.why,
    tags:  [],
    job,
  });

  em.persist(candidate);
  await em.flush();

  redirect(`/candidates/${candidate.id}`);
}

export async function updateCandidateNotes(id: number, notes: string) {
  const em        = await getEm();
  const candidate = await em.findOne(Candidate, { id }, { populate: ["job"] });
  if (!candidate) throw new Error("Candidat introuvable");

  const skills       = (candidate.skills as string[] | null) ?? [];
  const requirements = (candidate.job.requirements as string[] | null) ?? [];

  const base     = scoreCandidate({ candidateSkills: skills, jobRequirements: requirements });
  const trimmed  = notes.trim() || undefined;
  const analysis = trimmed ? analyzeInterviewNotes(trimmed) : null;
  const delta    = notesScoreDelta(analysis);

  const adjustedScore = Math.max(0, Math.min(100, base.score + delta));
  const fit           = scoreToFit(adjustedScore);

  let why = buildWhy(adjustedScore, fit, base.matchedSkills, base.missingSkills, skills);
  if (delta !== 0 && analysis) {
    const sign  = delta > 0 ? `+${delta}` : `${delta}`;
    const label = analysis.tendency === "positive" ? "positifs" : "négatifs";
    why += ` Entretien : signaux ${label} (${sign} pts).`;
  }

  em.assign(candidate, { notes: trimmed, score: adjustedScore, fit, why });
  await em.flush();
  revalidatePath(`/candidates/${id}`);
  revalidatePath("/triage");
}

export async function updateCandidateTags(id: number, tags: string[]) {
  const em        = await getEm();
  const candidate = await getCandidateById(id);
  if (!candidate) throw new Error("Candidat introuvable");

  const ref = em.getReference(Candidate, id);
  em.assign(ref, { tags });
  await em.flush();
}
