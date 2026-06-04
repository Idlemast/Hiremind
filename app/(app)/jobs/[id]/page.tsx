import { getJobById, getApplications, getApplicationStatsByScore, getThresholds } from "@/lib/db";
import { jobUrl, candidateUrl } from "@/lib/slugify";
import { notFound } from "next/navigation";
import Link from "next/link";
import StagePipeline from "@/components/StagePipeline";
import SaveAsTemplateButton from "@/components/SaveAsTemplateButton";
import DeleteJobButton from "@/components/DeleteJobButton";
import ArchiveJobButton from "@/components/ArchiveJobButton";
import DuplicateJobButton from "@/components/DuplicateJobButton";
import JobCandidatesView from "@/components/JobCandidatesView";
import type { PlainApp } from "@/components/JobCandidatesView";
import { scoreToFit } from "@/lib/thresholds";
import { DEFAULT_STAGES } from "@/lib/stages";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }  = await params;
  const jobId   = parseInt(id, 10);

  const [job, thresholds] = await Promise.all([getJobById(jobId), getThresholds()]);
  if (!job) notFound();

  const [allApplications, stats] = await Promise.all([
    getApplications(jobId),
    getApplicationStatsByScore(jobId, thresholds),
  ]);

  const rawStages    = job.stages as string[] | null | undefined;
  const stages       = rawStages?.length ? rawStages : DEFAULT_STAGES;
  const stageIndex   = job.currentStageIndex ?? 0;
  const currentStage = stages[stageIndex] ?? job.stage;
  const requirements = (job.requirements as string[] | null) ?? [];

  const { total: totalApplications, strong: strongCount, medium: mediumCount, weak: weakCount } = stats;

  const plainApps: PlainApp[] = allApplications.map((a) => ({
    id:          a.id,
    candidateId: a.candidate.id,
    name:        a.candidate.name,
    role:        a.candidate.role,
    skills:      (a.candidate.skills as string[] | null) ?? [],
    score:       a.score,
    fit:         scoreToFit(a.score, thresholds),
    stageIndex:  a.stageIndex,
    appliedAt:   new Date(a.appliedAt).toISOString(),
  }));

  return (
    <div className="p-4 lg:p-xl max-w-7xl mx-auto space-y-xl">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-md">
        <div className="flex items-center gap-lg min-w-0">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${job.iconBg} shrink-0`}>
            <span className="material-symbols-outlined text-2xl">{job.icon}</span>
          </div>
          <div className="min-w-0">
            <h2 className="font-h1 text-h1 text-on-surface truncate">{job.title}</h2>
            <p className="text-body-sm text-slate-500 mt-0.5 truncate">
              {job.department} · {job.location}
              {job.budget && <span className="ml-2 text-slate-400">· {job.budget}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Link href={`${jobUrl(jobId, job.title)}/edit`}
            className="p-2 sm:px-3 sm:py-2 bg-white border border-outline-variant text-on-surface-variant font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-sm"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            <span className="hidden sm:inline">Modifier</span>
          </Link>
          <ArchiveJobButton jobId={jobId} status={job.status} />
          <DuplicateJobButton jobId={jobId} />
          <SaveAsTemplateButton jobId={jobId} />
          <DeleteJobButton jobId={jobId} jobTitle={job.title} />
          <Link href="/jobs"
            className="text-sm text-slate-400 hover:text-primary flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="hidden sm:inline">Postes</span>
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
          <div className="flex items-center gap-3">
            <span className="text-label-caps font-label-caps text-slate-400">{stageIndex + 1} / {stages.length}</span>
            {stageIndex < stages.length - 1 && (
              <Link href={`${jobUrl(jobId, job.title)}/advance`}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-container transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                Étape suivante
              </Link>
            )}
          </div>
        </div>
        <StagePipeline jobId={jobId} initialStages={stages} initialCurrentIndex={stageIndex} />
      </section>

      {/* ── Stats cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        {[
          { label: "Candidats",  value: totalApplications, icon: "group",        color: "text-primary" },
          { label: "Strong Fit", value: strongCount,        icon: "check_circle", color: "text-emerald-600" },
          { label: "À évaluer",  value: mediumCount,        icon: "pending",      color: "text-amber-600" },
          { label: "Faible Fit", value: weakCount,          icon: "cancel",       color: "text-slate-400" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm text-center">
            <span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span>
            <p className="font-h1 text-2xl font-bold text-on-surface mt-1">{value}</p>
            <p className="text-label-caps text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Candidates (list + kanban, client-side toggle) ─── */}
      <JobCandidatesView
        allApps={plainApps}
        stages={stages}
        requirements={requirements}
        jobId={jobId}
        jobTitle={job.title}
        strongCount={strongCount}
        totalApplications={totalApplications}
      />
    </div>
  );
}
