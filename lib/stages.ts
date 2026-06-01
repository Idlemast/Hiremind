export interface StageOption {
  key: string;
  label: string;
  group: string;
}

export const STAGE_OPTIONS: StageOption[] = [
  // ── Sourcing ────────────────────────────────────────────────────────────────
  { key: "sourcing",              label: "Sourcing",                       group: "Sourcing" },
  { key: "reception_candidature", label: "Réception de candidature",       group: "Sourcing" },
  { key: "preselection_cv",       label: "Présélection CV",                group: "Sourcing" },
  { key: "vivier",                label: "Ajout au vivier",                group: "Sourcing" },

  // ── Screening ───────────────────────────────────────────────────────────────
  { key: "appel_decouverte",      label: "Appel découverte",               group: "Screening" },
  { key: "entretien_rh",          label: "Entretien RH",                   group: "Screening" },
  { key: "questionnaire",         label: "Questionnaire de présélection",  group: "Screening" },
  { key: "test_personnalite",     label: "Test de personnalité",           group: "Screening" },

  // ── Évaluation ──────────────────────────────────────────────────────────────
  { key: "test_technique",        label: "Test technique",                 group: "Évaluation" },
  { key: "etude_de_cas",          label: "Étude de cas",                   group: "Évaluation" },
  { key: "mise_en_situation",     label: "Mise en situation",              group: "Évaluation" },
  { key: "revue_portfolio",       label: "Revue de portfolio",             group: "Évaluation" },
  { key: "assessment_center",     label: "Assessment center",              group: "Évaluation" },
  { key: "devoir_maison",         label: "Devoir à la maison",             group: "Évaluation" },

  // ── Entretiens ──────────────────────────────────────────────────────────────
  { key: "entretien_manager",     label: "Entretien managérial",           group: "Entretiens" },
  { key: "entretien_technique",   label: "Entretien technique",            group: "Entretiens" },
  { key: "entretien_equipe",      label: "Entretien avec l'équipe",        group: "Entretiens" },
  { key: "entretien_produit",     label: "Entretien produit",              group: "Entretiens" },
  { key: "entretien_direction",   label: "Entretien avec la direction",    group: "Entretiens" },
  { key: "panel_entretien",       label: "Panel d'entretien",              group: "Entretiens" },
  { key: "entretien_final",       label: "Entretien final",                group: "Entretiens" },

  // ── Décision ────────────────────────────────────────────────────────────────
  { key: "verif_references",      label: "Vérification des références",    group: "Décision" },
  { key: "verif_antecedents",     label: "Vérification des antécédents",   group: "Décision" },
  { key: "deliberation",          label: "Délibération interne",           group: "Décision" },
  { key: "offre",                 label: "Proposition d'offre",            group: "Décision" },
  { key: "negociation",           label: "Négociation",                    group: "Décision" },
  { key: "offre_acceptee",        label: "Offre acceptée",                 group: "Décision" },
];

// Ordered labels for quick lookup
export const STAGE_LABELS = STAGE_OPTIONS.map((o) => o.label);

// Default pipeline — subset of STAGE_OPTIONS in order
export const DEFAULT_STAGES = [
  "Sourcing",
  "Présélection CV",
  "Entretien RH",
  "Test technique",
  "Entretien final",
  "Proposition d'offre",
];

// Plain serializable type for JobTemplate — safe to pass to Client Components
export interface PlainTemplate {
  id: number;
  name: string;
  title: string;
  department: string;
  location: string;
  icon: string;
  iconBg: string;
  requirements: string[];
  stages: string[];
}

export function deriveProgress(index: number, total: number): number {
  if (total <= 1) return 0;
  return Math.round((index / (total - 1)) * 100);
}

// Groups for display
export function groupedStageOptions(): Record<string, StageOption[]> {
  return STAGE_OPTIONS.reduce<Record<string, StageOption[]>>((acc, opt) => {
    (acc[opt.group] ??= []).push(opt);
    return acc;
  }, {});
}
