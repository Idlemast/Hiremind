import { getApplications, getJobs, getThresholds } from "@/lib/db";
import StatsClient from "@/components/StatsClient";
import type { PlainApp, PlainJob } from "@/components/StatsClient";

export default async function StatsPage() {
  const [allApplications, jobs, thresholds] = await Promise.all([
    getApplications(),
    getJobs(),
    getThresholds(),
  ]);

  const plainApps: PlainApp[] = allApplications.map((a) => ({
    id:            a.id,
    candidateId:   a.candidate.id,
    candidateName: a.candidate.name,
    jobId:         a.job.id,
    jobTitle:      a.job.title,
    jobStages:     (a.job.stages as string[] | null) ?? [],
    stageIndex:    a.stageIndex,
    score:         a.score,
    fit:           a.fit,
    source:        a.candidate.source || "Autre",
    gaps:          (a.gaps as string[] | null) ?? [],
    appliedAt:     new Date(a.appliedAt).toISOString(),
    movedAt:       a.movedAt ? new Date(a.movedAt).toISOString() : null,
  }));

  const plainJobs: PlainJob[] = jobs.map((j) => ({ id: j.id, title: j.title }));

  return (
    <div className="p-4 lg:p-xl max-w-6xl mx-auto space-y-xl">
      <div>
        <h2 className="font-h2 text-h2 text-primary">Statistiques</h2>
        <p className="text-body-sm text-slate-500 mt-1">Vue globale du pipeline de recrutement.</p>
      </div>
      <StatsClient allApps={plainApps} jobs={plainJobs} thresholds={thresholds} />
    </div>
  );
}
