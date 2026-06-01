export type SignalTendency = "positive" | "negative" | "neutral";

export interface SignalAnalysis {
  tendency: SignalTendency;
  positiveMatches: string[];
  negativeMatches: string[];
  score: number; // -1.0 to +1.0
}

const NEGATIVE_SIGNALS: [RegExp, string][] = [
  [/\bhésitant[e]?\b/i,           "hésitant"],
  [/\bhésitation\b/i,             "hésitation"],
  [/\bvague\b/i,                  "vague"],
  [/\bflou[e]?\b/i,               "flou"],
  [/\bévasif|évasive\b/i,         "évasif"],
  [/\bimprécis[e]?\b/i,           "imprécis"],
  [/\bsuperficiel(?:le)?\b/i,     "superficiel"],
  [/\bcontradictoire\b/i,         "contradictoire"],
  [/\bpas de (détails?|précision|recul|concret)\b/i, "manque de détails"],
  [/\bpeu de (détails?|recul|précision|concret)\b/i, "peu de détails"],
  [/\bmanque de (précision|détails?|recul|concret|clarté)\b/i, "manque de précision"],
  [/\bne (sait|se souvient) (pas|plus)\b/i, "ne sait pas"],
  [/\bpeu convainc(ant[e]?|u[e]?)\b/i, "peu convaincant"],
  [/\bmal à l['']aise\b/i,        "mal à l'aise"],
  [/\bn['']arrive pas à développer\b/i, "n'arrive pas à développer"],
  [/\bincapable de développer\b/i, "incapable de développer"],
  [/\bpas capable de développer\b/i, "pas capable de développer"],
  [/\bne développe pas\b/i,       "ne développe pas"],
  [/\bévite (les questions|de répondre)\b/i, "évite les questions"],
  [/\bréponses? courtes?\b/i,     "réponses courtes"],
  [/\bpeu structuré[e]?\b/i,      "peu structuré"],
  [/\bpas structuré[e]?\b/i,      "pas structuré"],
  [/\bpas clair[e]?\b/i,          "pas clair"],
  [/\bpeu clair[e]?\b/i,          "peu clair"],
  [/\bpas de motivation\b/i,      "pas de motivation"],
  [/\bpeu motivé[e]?\b/i,         "peu motivé"],
  [/\bmanque d['']enthousiasme\b/i, "manque d'enthousiasme"],
];

const POSITIVE_SIGNALS: [RegExp, string][] = [
  [/\benthousiaste\b/i,           "enthousiaste"],
  [/\benthousiasme\b/i,           "enthousiasme"],
  [/\bclair[e]?\b/i,              "clair"],
  [/\bprécis[e]?\b/i,             "précis"],
  [/\bexemples? concrets?\b/i,    "exemples concrets"],
  [/\bproactif|proactive\b/i,     "proactif"],
  [/\bmotivé[e]?\b/i,             "motivé"],
  [/\bbonne communication\b/i,    "bonne communication"],
  [/\bpertinent[e]?\b/i,          "pertinent"],
  [/\bstructuré[e]?\b/i,          "structuré"],
  [/\bconvaincant[e]?\b/i,        "convaincant"],
  [/\bà l['']aise\b/i,            "à l'aise"],
  [/\bsolide\b/i,                 "solide"],
  [/\brigoureux|rigoureuse\b/i,   "rigoureux"],
  [/\bbien développé[e]?\b/i,     "bien développé"],
  [/\bdéveloppe bien\b/i,         "développe bien"],
  [/\bcohérent[e]?\b/i,           "cohérent"],
  [/\bbon (recul|esprit d['']analyse|sens critique)\b/i, "bon recul"],
  [/\bforce de proposition\b/i,   "force de proposition"],
  [/\btrès (motivé[e]?|pertinent[e]?|clair[e]?|solide)\b/i, "très positif"],
];

// Returns an integer score delta in [-15, +15]
export function notesScoreDelta(analysis: SignalAnalysis | null): number {
  if (!analysis) return 0;
  return Math.round(analysis.score * 15);
}

export function analyzeInterviewNotes(notes: string): SignalAnalysis | null {
  const text = notes.trim();
  if (text.length < 10) return null;

  const positiveMatches: string[] = [];
  const negativeMatches: string[] = [];

  for (const [pattern, label] of NEGATIVE_SIGNALS) {
    if (pattern.test(text) && !negativeMatches.includes(label)) {
      negativeMatches.push(label);
    }
  }

  for (const [pattern, label] of POSITIVE_SIGNALS) {
    if (pattern.test(text) && !positiveMatches.includes(label)) {
      positiveMatches.push(label);
    }
  }

  const total = positiveMatches.length + negativeMatches.length;
  if (total === 0) return null;

  const score = (positiveMatches.length - negativeMatches.length) / total;

  let tendency: SignalTendency;
  if (score > 0.2) tendency = "positive";
  else if (score < -0.2) tendency = "negative";
  else tendency = "neutral";

  return { tendency, positiveMatches, negativeMatches, score };
}
