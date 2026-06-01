import { getJobById, getCandidates, getThresholds } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import StagePipeline from "@/components/StagePipeline";
import SaveAsTemplateButton from "@/components/SaveAsTemplateButton";
import { scoreToFit, DECISION_META, fitToDecision } from "@/lib/thresholds";
import { DEFAULT_STAGES } from "@/lib/stages";

const fitColors = {
  strong: "bg-emerald-50 text-emerald-700 border-emerald-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  weak:   "bg-slate-50 text-slate-400 border-slate-100",
} as const;

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobId  = Number(id);

  const [job, allCandidates, thresholds] = await Promise.all([
    getJobById(jobId),
    getCandidates(jobId),
    getThresholds(),
  ]);
  if (!job) notFound();

  const rawStages   = job.stages as string[] | null | undefined;
  const stages      = rawStages?.length ? rawStages : DEFAULT_STAGES;
  const stageIndex  = job.currentStageIndex ?? 0;
  const currentStage = stages[stageIndex] ?? job.stage;

  const candidates = allCandidates.map((c) => ({
    ...c,
    fit: scoreToFit(c.score, thresholds),
  }));

  const strongCount  = candidates.filter((c) => c.fit === "strong").length;
  const mediumCount  = candidates.filter((c) => c.fit === "medium").length;
  const weakCount    = candidates.filter((c) => c.fit === "weak").length;

  return (
    <div className="p-xl max-w-6xl mx-auto space-y-xl">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-md">
        <div className="flex items-center gap-lg">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${job.iconBg} shrink-0`}>
            <span className="material-symbols-outlined text-2xl">{job.icon}</span>
          </div>
          <div>
            <h2 className="font-h1 text-h1 text-on-surface">{job.title}</h2>
            <p className="text-body-sm text-slate-500 mt-0.5">
              {job.department} · {job.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <SaveAsTemplateButton jobId={jobId} />
          <Link
            href="/jobs"
            className="text-sm text-slate-400 hover:text-primary flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Tous les postes
          </Link>
        </div>
      </div>

      {/* ── Pipeline ──────────────────────────────────────── */}
      <section className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
        <div className="flex items-center justify-between mb-lg">
          <div>
            <h3 className="font-h3 text-h3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">linear_scale</span>
              Pipeline de recrutement
            </h3>
            <p className="text-body-sm text-slate-500 mt-0.5">
              Étape actuelle : <strong>{currentStage}</strong> · {job.progress}% complété
            </p>
          </div>
          <span className="text-label-caps font-label-caps text-slate-400">
            {stageIndex + 1} / {stages.length}
          </span>
        </div>
        <StagePipeline
          jobId={jobId}
          initialStages={stages}
          initialCurrentIndex={stageIndex}
        />
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-md">
        {[
          { label: "Candidats", value: candidates.length, icon: "group", color: "text-primary" },
          { label: "Strong Fit", value: strongCount, icon: "check_circle", color: "text-emerald-600" },
          { label: "À évaluer", value: mediumCount, icon: "pending", color: "text-amber-600" },
          { label: "Faible Fit", value: weakCount,  icon: "cancel",       color: "text-slate-400" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm text-center">
            <span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span>
            <p className="font-h1 text-2xl font-bold text-on-surface mt-1">{value}</p>
            <p className="text-label-caps text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Candidate list ────────────────────────────────── */}
      <section className="space-y-md">
        <h3 className="font-h3 text-h3">Candidats</h3>

        {candidates.length === 0 && (
          <div className="bg-white border border-outline-variant rounded-xl p-xl text-center text-slate-400">
            <span className="material-symbols-outlined text-4xl block mb-2">person_search</span>
            <p>Aucun candidat pour ce poste.</p>
            <Link href="/candidates/new" className="mt-md inline-flex items-center gap-1 text-primary font-bold text-sm hover:underline">
              <span className="material-symbols-outlined text-sm">person_add</span>
              Importer un candidat
            </Link>
          </div>
        )}

        {(["strong", "medium", "weak"] as const).map((fit) => {
          const group = candidates.filter((c) => c.fit === fit);
          if (group.length === 0) return null;
          const decision = fitToDecision(fit);
          const meta = DECISION_META[decision];
          return (
            <div key={fit}>
              <div className="flex items-center gap-2 mb-sm">
                <span className={`material-symbols-outlined text-sm ${meta.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {meta.icon}
                </span>
                <h4 className="font-label-caps text-label-caps text-slate-500 uppercase">
                  {meta.label} — {group.length} candidat{group.length > 1 ? "s" : ""}
                </h4>
              </div>
              <div className="space-y-sm">
                {group.map((c) => (
                  <Link
                    key={c.id}
                    href={`/candidates/${c.id}`}
                    className="bg-white border border-slate-200 rounded-xl p-md flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0">
                        {c.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-body-sm text-on-surface">{c.name}</p>
                        <p className="text-label-caps text-slate-400">{c.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-label-caps font-label-caps border ${fitColors[fit]}`}>
                        {c.score}% match
                      </span>
                      <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
