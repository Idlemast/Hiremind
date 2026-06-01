export type Fit = "strong" | "medium" | "weak";
export type Decision = "advance" | "review" | "reject";

export interface Thresholds {
  strong: number;
  medium: number;
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  strong: 80,
  medium: 55,
};

export function scoreToFit(score: number, thresholds: Thresholds = DEFAULT_THRESHOLDS): Fit {
  if (score >= thresholds.strong) return "strong";
  if (score >= thresholds.medium) return "medium";
  return "weak";
}

export function fitToDecision(fit: Fit): Decision {
  if (fit === "strong") return "advance";
  if (fit === "medium") return "review";
  return "reject";
}

export const DECISION_META: Record<
  Decision,
  { label: string; icon: string; color: string; badge: string }
> = {
  advance: {
    label: "Avancer",
    icon: "check_circle",
    color: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  review: {
    label: "À évaluer",
    icon: "pending",
    color: "text-amber-700",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
  },
  reject: {
    label: "Décliner",
    icon: "cancel",
    color: "text-red-600",
    badge: "bg-red-100 text-red-800 border-red-200",
  },
};

export interface CandidateContext {
  firstName: string;
  jobTitle: string;
  gaps: string[];
  matchedSkills: string[];
}

export function getCommTemplates(
  ctx: CandidateContext,
  decision: Decision
): { advance: string | null; reject: string | null } {
  const { firstName, jobTitle, gaps, matchedSkills } = ctx;

  const advance =
    decision !== "reject"
      ? `Bonjour ${firstName},\n\nMerci pour votre candidature au poste de ${jobTitle}. Votre profil retient toute notre attention et nous souhaiterions vous inviter à la prochaine étape du processus de sélection.\n\nPouvez-vous nous indiquer vos disponibilités pour un entretien cette semaine ?\n\nCordialement,`
      : null;

  const reject =
    decision !== "advance"
      ? buildRejectionEmail(firstName, jobTitle, gaps, matchedSkills)
      : null;

  return { advance, reject };
}

function joinList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

function buildRejectionEmail(
  firstName: string,
  jobTitle: string,
  gaps: string[],
  matchedSkills: string[]
): string {
  // ── Paragraph 1 : ouverture ──────────────────────────────────────────
  const opening =
    `Merci d'avoir postulé au poste de ${jobTitle} — ` +
    `nous apprécions sincèrement le temps que vous y avez consacré.`;

  // ── Paragraph 2 : rejet + raison naturelle ───────────────────────────
  let rejectionBody: string;
  if (gaps.length === 0) {
    rejectionBody =
      `Après examen de votre profil, nous avons décidé d'aller de l'avant avec d'autres candidat·e·s ` +
      `dont le parcours correspond plus précisément à ce que nous cherchons à ce stade du recrutement.`;
  } else if (gaps.length === 1) {
    rejectionBody =
      `Après examen de votre profil, nous ne sommes malheureusement pas en mesure de donner suite. ` +
      `Ce rôle demande une maîtrise opérationnelle de ${gaps[0]}, et nous avons besoin de quelqu'un ` +
      `qui puisse être autonome rapidement sur ce point — ce qui ne ressort pas encore clairement de votre candidature.`;
  } else {
    const shownGaps = joinList(gaps.slice(0, 3));
    const tail = gaps.length > 3 ? `, entre autres` : ``;
    rejectionBody =
      `Après examen de votre profil, nous ne sommes malheureusement pas en mesure de donner suite. ` +
      `Ce rôle demande une pratique solide de ${shownGaps}${tail}, ` +
      `et nous recherchons quelqu'un qui puisse être autonome rapidement sur ces compétences — ` +
      `ce qui ne ressort pas encore suffisamment de votre parcours.`;
  }

  // ── Paragraph 3 : forces + conseil tissé ensemble ────────────────────
  let adviceBody: string;
  if (gaps.length === 0) {
    // Pas de lacune identifiée → encouragement général
    adviceBody =
      matchedSkills.length > 0
        ? `Votre expérience en ${joinList(matchedSkills.slice(0, 2))} est un vrai atout — ` +
          `continuez à la faire valoir et n'hésitez pas à revenir vers nous si d'autres postes s'ouvrent.`
        : `N'hésitez pas à suivre nos prochaines offres — votre profil pourrait correspondre à d'autres opportunités.`;
  } else if (matchedSkills.length > 0) {
    const shownSkills = joinList(matchedSkills.slice(0, 2));
    const primaryGap = gaps[0];
    const secondGap = gaps[1] ?? null;
    adviceBody =
      `Cela dit, votre expérience en ${shownSkills} est solide, et c'est loin d'être anodin. ` +
      `Si ce type de poste vous attire, concentrez-vous sur ${primaryGap}` +
      (secondGap ? ` et ${secondGap}` : ``) +
      ` : un projet concret, même modeste, pèse souvent plus lourd qu'un long cours théorique. ` +
      `Vous pourriez voir la différence sur votre profil plus vite que vous ne le pensez.`;
  } else {
    const primaryGap = gaps[0];
    const secondGap = gaps[1] ?? null;
    adviceBody =
      `Si ce domaine vous attire, l'idéal serait de vous concentrer sur ${primaryGap}` +
      (secondGap ? ` et ${secondGap}` : ``) +
      ` dans un premier temps. Un projet personnel ou une contribution open source ` +
      `dans ces domaines peut vraiment transformer un profil — et beaucoup plus vite qu'on ne l'imagine.`;
  }

  // ── Paragraph 4 : encouragement sincère ─────────────────────────────
  const encouragement =
    `Ne vous découragez pas : la frontière entre "profil presque là" et "profil retenu" ` +
    `est souvent plus fine qu'elle n'y paraît. Continuez à construire, ` +
    `et n'hésitez pas à repostuler si votre parcours évolue dans ces directions.`;

  // ── Clôture ──────────────────────────────────────────────────────────
  const closing = `Bonne continuation, et encore merci pour l'intérêt que vous portez à notre organisation.`;

  return [
    `Bonjour ${firstName},`,
    ``,
    opening,
    ``,
    rejectionBody,
    ``,
    adviceBody,
    ``,
    encouragement,
    ``,
    closing,
    ``,
    `Cordialement,`,
  ].join("\n");
}
