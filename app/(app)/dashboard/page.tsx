import { getJobs, getCandidates } from "@/lib/db";
import Card from "@/components/Card";

export default async function DashboardPage() {
  const [jobs, candidates] = await Promise.all([getJobs(), getCandidates()]);

  const strong  = candidates.filter((c) => c.fit === "strong").length;
  const clarity = candidates.length > 0 ? Math.round((strong / candidates.length) * 100) : 0;
  const pending = candidates.length;

  // Average days open across all jobs
  const now = Date.now();
  const avgDays = jobs.length > 0
    ? Math.round(jobs.reduce((sum, j) => sum + (now - new Date(j.openedAt).getTime()), 0) / jobs.length / 86_400_000)
    : 0;

  return (
    <div className="p-8 space-y-xl">

      {/* KPI Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-lg">
        <Card ribbon="bg-blue-500" className="flex flex-col justify-between h-32">
          <p className="font-label-caps text-label-caps text-secondary uppercase">Active Reqs</p>
          <h2 className="font-h1 text-h1 text-primary">{jobs.length}</h2>
        </Card>
        <Card ribbon="bg-emerald-500" className="flex flex-col justify-between h-32">
          <p className="font-label-caps text-label-caps text-secondary uppercase">Decision Clarity</p>
          <div className="flex items-baseline gap-2">
            <h2 className="font-h1 text-h1 text-primary">{clarity}%</h2>
            <span className="text-emerald-600 text-xs font-bold">{strong} strong fits</span>
          </div>
        </Card>
        <Card ribbon="bg-amber-500" className="flex flex-col justify-between h-32">
          <p className="font-label-caps text-label-caps text-secondary uppercase">Pending Reviews</p>
          <h2 className="font-h1 text-h1 text-primary">{pending}</h2>
        </Card>
        <Card ribbon="bg-slate-400" className="flex flex-col justify-between h-32">
          <p className="font-label-caps text-label-caps text-secondary uppercase">Avg. Days Open</p>
          <h2 className="font-h1 text-h1 text-primary">{avgDays}d</h2>
        </Card>
      </section>

      {/* Priority for Review */}
      <section>
        <div className="flex items-center justify-between mb-md">
          <h3 className="font-h3 text-h3 text-blue-900">Priority for Review</h3>
          <a className="text-sm font-semibold text-primary hover:underline" href="/triage">
            View all candidates
          </a>
        </div>

        <div className="grid grid-cols-12 gap-lg">
          {/* Top strong-fit candidate */}
          {(() => {
            const top = candidates.find((c) => c.fit === "strong");
            if (!top) return null;
            return (
              <div className="col-span-12 lg:col-span-8 tonal-card rounded-xl p-lg flex flex-col md:flex-row gap-lg relative">
                <div className="status-ribbon bg-primary" />
                <div className="w-full md:w-1/3 space-y-md">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Critical Signal
                  </span>
                  <h4 className="font-h2 text-h2 leading-tight">{top.job.title}</h4>
                  <p className="text-body-sm text-secondary">
                    {top.name} matches {top.score}% of core requirements.
                  </p>
                  <div className="pt-4">
                    <a
                      href={`/candidates/${top.id}`}
                      className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-primary-container transition-all"
                    >
                      Review Candidate
                    </a>
                  </div>
                </div>
                <div className="flex-1 h-48 md:h-auto rounded-lg bg-slate-100 flex items-center justify-center">
                  <div className="bg-white/90 p-lg rounded-xl shadow-xl border border-white/50 text-center">
                    <p className="font-label-caps text-primary text-[10px] mb-2">MATCH SCORE</p>
                    <div className="w-24 h-24 rounded-xl border-4 border-emerald-500 mx-auto flex items-center justify-center mb-md">
                      <span className="font-h2 text-h2 text-primary">{top.score}</span>
                    </div>
                    <p className="text-body-sm font-semibold whitespace-nowrap">
                      {top.company}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Stalled roles (jobs with low progress) */}
          {(() => {
            const stalled = jobs.find((j) => j.progress < 30);
            if (!stalled) return null;
            const count = stalled.candidates.count();
            return (
              <div className="col-span-12 md:col-span-6 lg:col-span-4 tonal-card rounded-xl p-lg relative flex flex-col justify-between">
                <div className="status-ribbon bg-amber-400" />
                <div className="space-y-sm">
                  <div className="flex justify-between items-start">
                    <h4 className="font-h3 text-h3 leading-tight">{stalled.title}</h4>
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      {stalled.stage}
                    </span>
                  </div>
                  <p className="text-body-sm text-secondary">
                    {count} candidate{count !== 1 ? "s" : ""} · {stalled.progress}% complete.
                  </p>
                </div>
                <div className="mt-lg">
                  <a
                    href="/triage"
                    className="block w-full text-center border border-outline text-on-surface py-2 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    View Triage
                  </a>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Active Requisitions */}
      <section>
        <div className="flex items-center justify-between mb-md">
          <h3 className="font-h3 text-h3 text-blue-900">Active Requisitions</h3>
          <a href="/jobs" className="text-sm font-semibold text-primary hover:underline">
            View all
          </a>
        </div>

        <div className="space-y-md">
          <div className="grid grid-cols-12 px-lg text-slate-400">
            <div className="col-span-5 font-label-caps text-label-caps">ROLE &amp; DEPARTMENT</div>
            <div className="col-span-2 font-label-caps text-label-caps text-center">VOLUME</div>
            <div className="col-span-3 font-label-caps text-label-caps">HIRE PROGRESS</div>
            <div className="col-span-2 font-label-caps text-label-caps text-right">ACTION</div>
          </div>

          {jobs.map((job) => (
            <div key={job.id} className="tonal-card rounded-xl p-lg grid grid-cols-12 items-center relative overflow-hidden">
              <div className="status-ribbon bg-blue-500" />
              <div className="col-span-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded flex items-center justify-center ${job.iconBg}`}>
                  <span className="material-symbols-outlined">{job.icon}</span>
                </div>
                <div>
                  <p className="font-h3 text-body-md font-bold text-slate-900">{job.title}</p>
                  <p className="text-xs text-slate-500">{job.department} · {job.location}</p>
                </div>
              </div>
              <div className="col-span-2 text-center">
                <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                  <span className="material-symbols-outlined text-sm text-blue-600">group</span>
                  <span className="text-sm font-bold text-slate-700">{job.candidates.length}</span>
                </div>
              </div>
              <div className="col-span-3 pr-8">
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${job.progress}%` }} />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] font-bold text-slate-400">STAGE: {job.stage}</span>
                  <span className="text-[10px] font-bold text-emerald-600">{job.progress}% COMPLETE</span>
                </div>
              </div>
              <div className="col-span-2 text-right">
                <a href="/triage" className="text-primary font-bold text-sm hover:text-blue-800 flex items-center gap-1 ml-auto">
                  Open Triage
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
