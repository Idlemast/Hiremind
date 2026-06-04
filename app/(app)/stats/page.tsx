import { getApplicationsLean, getJobs, getThresholds } from "@/lib/db";
import StatsClient from "@/components/StatsClient";
import type { PlainApp, PlainJob } from "@/components/StatsClient";

export default async function StatsPage() {
  const [leanApps, jobs, thresholds] = await Promise.all([
    getApplicationsLean(),
    getJobs(),
    getThresholds(),
  ]);

  const plainApps: PlainApp[] = leanApps;
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
