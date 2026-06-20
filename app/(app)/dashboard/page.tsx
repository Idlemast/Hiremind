import { getJobs, getDashboardStats, getThresholds } from "@/lib/db";
import { jobUrl, candidateUrl } from "@/lib/slugify";

export default async function DashboardPage() {
  const thresholds = await getThresholds();
  const [jobs, stats] = await Promise.all([
    getJobs(),
    getDashboardStats(thresholds),
  ]);

  const { total, strong, countByJob, topApp } = stats;
  const clarity = total > 0 ? Math.round((strong / total) * 100) : 0;

  const now     = Date.now();
  const avgDays = jobs.length > 0
    ? Math.round(jobs.reduce((sum, j) => sum + (now - new Date(j.openedAt).getTime()), 0) / jobs.length / 86_400_000)
    : 0;

  return (
    <div className="p-4 lg:p-xl space-y-xl">

      <section className="grid grid-cols-1 md:grid-cols-4 gap-lg">
        {[
          { dot: "bg-blue-500",    label: "Active Reqs",      value: jobs.length,    sub: null },
          { dot: "bg-emerald-500", label: "Decision Clarity",  value: `${clarity}%`, sub: `${strong} strong fits` },
          { dot: "bg-amber-500",   label: "Pending Reviews",   value: total,          sub: null },
          { dot: "bg-slate-400",   label: "Avg. Days Open",    value: `${avgDays}d`,  sub: null },
        ].map(({ dot, label, value, sub }) => (
          <div key={label} className="tonal-card rounded-xl p-lg flex flex-col gap-sm">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
              <p className="font-label-caps text-label-caps text-secondary uppercase">{label}</p>
            </div>
            <p className="font-h2 text-h2 text-on-surface">{value}</p>
            {sub && <p className="text-emerald-600 text-xs font-semibold">{sub}</p>}
          </div>
        ))}
      </section>

      {jobs.length === 0 && (
        <div className="text-center py-xl bg-white border border-dashed border-slate-200 rounded-xl space-y-3 text-slate-400">
          <span className="material-symbols-outlined text-5xl block">rocket_launch</span>
          <p className="font-semibold text-on-surface text-body-lg">Bienvenue sur HireMind</p>
          <p className="text-body-sm max-w-sm mx-auto">
            Créez votre premier poste, puis importez des candidats pour commencer le triage automatique.
          </p>
          <div className="flex justify-center gap-3 pt-sm">
            <a href="/jobs/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-container transition-colors shadow-sm">
              <span className="material-symbols-outlined text-sm">add</span>
              Créer un poste
            </a>
          </div>
        </div>
      )}

      {jobs.length > 0 && (<>
      <section>
        <div className="flex items-center justify-between mb-md">
          <h3 className="font-h3 text-h3 text-on-surface">Priority for Review</h3>
          <a className="text-sm font-semibold text-primary hover:underline" href="/jobs">
            View all candidates
          </a>
        </div>

        <div className="grid grid-cols-12 gap-lg">
          {topApp && (
            <div className="col-span-12 lg:col-span-8 tonal-card rounded-xl p-lg flex flex-col md:flex-row gap-lg">
              <div className="w-full md:w-1/3 space-y-md">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-label-caps font-bold uppercase">
                  Critical Signal
                </span>
                <h4 className="font-h2 text-h2 leading-tight">{topApp.jobTitle}</h4>
                <p className="text-body-sm text-secondary">
                  {topApp.candidateName} matches {topApp.score}% of core requirements.
                </p>
                <div className="pt-md">
                  <a
                    href={candidateUrl(topApp.candidateSalt, topApp.candidateName, topApp.jobSalt, topApp.jobTitle)}
                    className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-primary-container transition-all"
                  >
                    Review Candidate
                  </a>
                </div>
              </div>
              <div className="flex-1 h-48 md:h-auto rounded-lg bg-slate-100 flex items-center justify-center">
                <div className="text-center px-4 py-2">
                  <span className="font-label-caps text-label-caps text-secondary block mb-0.5">match score</span>
                  <span className="font-h1 text-h1 text-on-surface block">{topApp.score}%</span>
                  <span className="text-xs text-secondary mt-1 block">{topApp.candidateCompany}</span>
                </div>
              </div>
            </div>
          )}

          {(() => {
            const stalled = jobs.find((j) => j.progress < 30);
            if (!stalled) return null;
            const count = countByJob[stalled.id] ?? 0;
            return (
              <div className="col-span-12 md:col-span-6 lg:col-span-4 tonal-card rounded-xl p-lg flex flex-col justify-between">
                <div className="space-y-sm">
                  <div className="flex justify-between items-start">
                    <h4 className="font-h3 text-h3 leading-tight">{stalled.title}</h4>
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-label-caps font-bold uppercase">
                      {stalled.stage}
                    </span>
                  </div>
                  <p className="text-body-sm text-secondary">
                    {count} candidate{count !== 1 ? "s" : ""} · {stalled.progress}% complete.
                  </p>
                </div>
                <div className="mt-lg">
                  <a
                    href={jobUrl(stalled.salt!, stalled.title)}
                    className="block w-full text-center border border-outline text-on-surface py-2 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Voir le poste
                  </a>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-md">
          <h3 className="font-h3 text-h3 text-on-surface">Active Requisitions</h3>
          <a href="/jobs" className="text-sm font-semibold text-primary hover:underline">
            View all
          </a>
        </div>

        <div className="space-y-md">
          <div className="hidden lg:grid grid-cols-12 px-lg text-slate-500">
            <div className="col-span-5 font-label-caps text-label-caps">ROLE &amp; DEPARTMENT</div>
            <div className="col-span-2 font-label-caps text-label-caps text-center">VOLUME</div>
            <div className="col-span-3 font-label-caps text-label-caps">HIRE PROGRESS</div>
            <div className="col-span-2 font-label-caps text-label-caps text-right">ACTION</div>
          </div>

          {jobs.map((job) => {
            const count = countByJob[job.id] ?? 0;
            return (
              <div key={job.id} className="tonal-card rounded-xl p-lg">
                <div className="flex items-start justify-between gap-3 lg:hidden">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${job.iconBg}`}>
                      <span className="material-symbols-outlined text-base">{job.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate">{job.title}</p>
                      <p className="text-label-caps text-slate-500 truncate">{job.department}</p>
                    </div>
                  </div>
                  <a href={jobUrl(job.salt!, job.title)} className="text-primary shrink-0">
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </a>
                </div>
                <div className="mt-3 lg:hidden space-y-2">
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${job.progress}%` }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-label-caps text-slate-500">{job.stage}</span>
                    <span className="text-label-caps font-bold text-emerald-600">{job.progress}%</span>
                  </div>
                </div>
                <div className="hidden lg:grid grid-cols-12 items-center">
                  <div className="col-span-5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded flex items-center justify-center ${job.iconBg}`}>
                      <span className="material-symbols-outlined">{job.icon}</span>
                    </div>
                    <div>
                      <p className="font-h3 text-body-md font-bold text-slate-900">{job.title}</p>
                      <p className="text-label-caps text-slate-500">{job.department} · {job.location}</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                      <span className="material-symbols-outlined text-sm text-blue-600">group</span>
                      <span className="text-sm font-bold text-slate-700">{count}</span>
                    </div>
                  </div>
                  <div className="col-span-3 pr-8">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${job.progress}%` }} />
                    </div>
                    <div className="flex justify-between mt-sm">
                      <span className="text-label-caps font-bold text-slate-500 uppercase">STAGE: {job.stage}</span>
                      <span className="text-label-caps font-bold text-emerald-600 uppercase">{job.progress}%</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <a href={jobUrl(job.salt!, job.title)} className="text-primary font-bold text-sm hover:text-primary-container flex items-center gap-1 ml-auto">
                      Ouvrir
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      </>)}
    </div>
  );
}
