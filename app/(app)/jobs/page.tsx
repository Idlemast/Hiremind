import { getJobs } from "@/lib/db";

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <div className="p-8 space-y-xl">
      <div className="flex items-center justify-between">
        <p className="text-body-sm text-slate-500">{jobs.length} active requisitions</p>
        <a
          href="/jobs/new"
          className="bg-primary text-white px-5 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-primary-container transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Requisition
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
                <span className="text-sm font-bold text-slate-700">
                  {job.candidates.length}
                </span>
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
              <button className="text-primary font-bold text-sm hover:text-blue-800 flex items-center gap-1 ml-auto">
                Open Dashboard
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
