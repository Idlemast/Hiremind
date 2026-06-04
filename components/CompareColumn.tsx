import Link from "next/link";
import { candidateUrl } from "@/lib/slugify";
import type { Fit } from "@/lib/thresholds";
import { DECISION_META, fitToDecision } from "@/lib/thresholds";
import { DEFAULT_STAGES, deriveProgress } from "@/lib/stages";

export type CompareApp = {
  id:            number;
  candidateId:   number;
  candidateName: string;
  candidateRole: string;
  score:         number;
  fit:           Fit;
  why:           string | null;
  skills:        string[];
  gaps:          string[];
  stageIndex:    number;
  stages:        string[];
  notes:         string | null;
  salary:        string | null;
  jobBudget:     string | null;
  jobTitle:      string;
};

const FIT_BADGE: Record<Fit, string> = {
  strong: "bg-emerald-100 text-emerald-800 border-emerald-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  weak:   "bg-red-100 text-red-800 border-red-200",
};
const FIT_LABEL: Record<Fit, string> = {
  strong: "Strong Fit",
  medium: "À évaluer",
  weak:   "Weak Fit",
};
const FIT_BAR: Record<Fit, string> = {
  strong: "bg-emerald-500",
  medium: "bg-amber-400",
  weak:   "bg-slate-300",
};

export default function CompareColumn({
  app,
  onlySkills,
  sharedSkills,
}: {
  app:          CompareApp;
  onlySkills:   string[];
  sharedSkills: string[];
}) {
  const initials     = app.candidateName.split(" ").map((n) => n[0]).join("");
  const decision     = fitToDecision(app.fit);
  const decisionMeta = DECISION_META[decision];
  const stages       = app.stages.length > 0 ? app.stages : DEFAULT_STAGES;
  const stage        = stages[app.stageIndex] ?? stages[0];
  const progress     = deriveProgress(app.stageIndex, stages.length);

  return (
    <div className="flex-1 min-w-0 space-y-lg">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
        <div className="flex items-center gap-3 mb-md">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-white text-xl font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-h2 text-h2 text-on-surface">{app.candidateName}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-label-caps font-label-caps border ${FIT_BADGE[app.fit]}`}>
                {FIT_LABEL[app.fit]}
              </span>
            </div>
            <p className="text-body-sm text-slate-500 truncate">{app.candidateRole}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative w-14 h-14 rounded-xl border-4 border-emerald-400 flex items-center justify-center">
              <span className="font-h3 text-h3 font-bold text-primary">{app.score}</span>
            </div>
            <span className="text-label-caps text-slate-400">/ 100</span>
          </div>
          {app.salary && (
            <div className="text-body-sm text-slate-500">
              <span className="font-semibold">{app.salary}</span>
              {app.jobBudget && <span className="text-slate-400"> / budget {app.jobBudget}</span>}
            </div>
          )}
          <Link
            href={candidateUrl(app.candidateId, app.candidateName, app.id, app.jobTitle)}
            className="ml-auto flex items-center gap-1 text-primary text-sm font-semibold hover:underline"
          >
            Voir la fiche
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </Link>
        </div>
      </div>

      {/* ── The Why ─────────────────────────────────────────── */}
      <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm relative overflow-hidden">
        <div className={`status-ribbon ${FIT_BAR[app.fit]}`} />
        <h4 className="font-h3 text-h3 mb-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">auto_awesome</span>
          The Why
        </h4>
        <p className="text-body-sm text-on-surface-variant leading-relaxed">
          {app.why ?? "Aucune analyse disponible."}
        </p>
      </div>

      {/* ── Skills ──────────────────────────────────────────── */}
      <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm space-y-md">
        <h4 className="font-h3 text-h3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">verified</span>
          Compétences
        </h4>
        {app.skills.length === 0 ? (
          <p className="text-body-sm text-slate-400">Aucune compétence extraite.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {app.skills.map((skill) => {
              const isShared = sharedSkills.includes(skill);
              const isOnly   = onlySkills.includes(skill);
              return (
                <span
                  key={skill}
                  className={[
                    "px-2.5 py-1 rounded-full text-label-caps font-label-caps border",
                    isShared ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    isOnly   ? "bg-blue-50 text-blue-700 border-blue-200" :
                               "bg-slate-50 text-slate-500 border-slate-200",
                  ].join(" ")}
                  title={isShared ? "Partagé avec l'autre candidat" : isOnly ? "Uniquement chez ce candidat" : ""}
                >
                  {skill}
                </span>
              );
            })}
          </div>
        )}
        <div className="flex gap-3 pt-sm border-t border-slate-100 flex-wrap">
          <span className="flex items-center gap-1 text-label-caps text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Partagé
          </span>
          <span className="flex items-center gap-1 text-label-caps text-blue-600">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Uniquement ici
          </span>
        </div>
      </div>

      {/* ── Gaps ────────────────────────────────────────────── */}
      {app.gaps.length > 0 && (
        <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm relative overflow-hidden">
          <div className="status-ribbon bg-error" />
          <h4 className="font-h3 text-h3 mb-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-error">cancel</span>
            Gaps ({app.gaps.length})
          </h4>
          <ul className="space-y-1">
            {app.gaps.map((gap) => (
              <li key={gap} className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Stage ───────────────────────────────────────────── */}
      <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
        <h4 className="font-label-caps text-label-caps text-slate-400 uppercase tracking-wider mb-sm">Étape pipeline</h4>
        <div className="flex items-center justify-between mb-sm">
          <span className="text-label-caps font-semibold py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-100">
            {stage}
          </span>
          <span className="text-label-caps font-semibold text-emerald-600">{progress}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-label-caps text-slate-400 mt-sm">Étape {app.stageIndex + 1} / {stages.length}</p>
      </div>

      {/* ── Notes recruteur ─────────────────────────────────── */}
      {app.notes && (
        <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
          <h4 className="font-h3 text-h3 mb-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">edit_note</span>
            Notes recruteur
          </h4>
          <pre className="text-body-sm text-on-surface-variant whitespace-pre-wrap font-sans leading-relaxed bg-slate-50 rounded-lg p-md border border-slate-100">
            {app.notes}
          </pre>
        </div>
      )}

      {/* ── Decision ────────────────────────────────────────── */}
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${decisionMeta.badge}`}>
        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
          {decisionMeta.icon}
        </span>
        <span className="font-label-caps text-label-caps">
          Recommandation : <strong>{decisionMeta.label}</strong>
        </span>
      </div>
    </div>
  );
}
