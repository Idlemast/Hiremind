import { getJobById, getCandidates, getThresholds } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { scoreToFit, fitToDecision, getCommTemplates } from "@/lib/thresholds";
import { DEFAULT_STAGES } from "@/lib/stages";
import AdvanceStagePanel from "@/components/AdvanceStagePanel";
import type { CandidateEmailData } from "@/components/AdvanceStagePanel";

export default async function AdvanceStagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }  = await params;
  const jobId   = Number(id);

  const [job, allCandidates, thresholds] = await Promise.all([
    getJobById(jobId),
    getCandidates(jobId),
    getThresholds(),
  ]);
  if (!job) notFound();

  const rawStages  = job.stages as string[] | null | undefined;
  const stages     = rawStages?.length ? rawStages : DEFAULT_STAGES;
  const stageIndex = job.currentStageIndex ?? 0;
  const isLast     = stageIndex >= stages.length - 1;

  if (isLast) {
    return (
      <div className="p-xl max-w-3xl mx-auto text-center space-y-md">
        <span className="material-symbols-outlined text-4xl text-emerald-500">check_circle</span>
        <p className="font-h3 text-h3">Ce poste est à la dernière étape.</p>
        <Link href={`/jobs/${jobId}`} className="text-primary hover:underline text-sm">
          ← Retour au tableau de bord
        </Link>
      </div>
    );
  }

  const currentStage = stages[stageIndex];
  const nextStage    = stages[stageIndex + 1];

  // Build plain candidate data with pre-generated emails — safe for Client Component
  const candidateData: CandidateEmailData[] = allCandidates.map((c) => {
    const fit      = scoreToFit(c.score, thresholds);
    const decision = fitToDecision(fit);
    const skills   = (c.skills as string[]) ?? [];
    const gaps     = (c.gaps   as string[]) ?? [];
    const { advance, reject } = getCommTemplates(
      {
        firstName:    c.name.split(" ")[0],
        jobTitle:     job.title,
        gaps,
        matchedSkills: skills,
      },
      decision
    );
    return {
      id:           c.id,
      name:         c.name,
      email:        c.email ?? null,
      fit,
      decision,
      score:        c.score,
      advanceEmail: advance,
      rejectEmail:  reject,
    };
  });

  return (
    <div className="p-xl max-w-4xl mx-auto space-y-xl">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/jobs/${jobId}`}
            className="text-sm text-slate-400 hover:text-primary flex items-center gap-1 mb-sm transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {job.title}
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="font-h1 text-h1 text-on-surface">Passer à l'étape suivante</h2>
          </div>
          <div className="flex items-center gap-3 mt-sm">
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-label-caps font-label-caps">
              {currentStage}
            </span>
            <span className="material-symbols-outlined text-slate-400">arrow_forward</span>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-label-caps font-label-caps font-bold">
              {nextStage}
            </span>
          </div>
        </div>
      </div>

      <AdvanceStagePanel
        jobId={jobId}
        nextStageIndex={stageIndex + 1}
        candidates={candidateData}
      />
    </div>
  );
}
