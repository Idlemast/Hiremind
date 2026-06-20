import { getJobs, getTemplates, getApplicationCountsByJob, getFilledJobIds } from "@/lib/db";
import { jobUrl } from "@/lib/slugify";
import SearchBar from "@/components/ui/SearchBar";
import TemplateManager from "@/components/jobs/TemplateManager";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [rawJobs, templates, appCounts, filledJobIds] = await Promise.all([
    getJobs(q || undefined),
    getTemplates(),
    getApplicationCountsByJob(),
    getFilledJobIds(),
  ]);

  const openCount = rawJobs.filter((j) => j.status !== "closed").length;
  const jobs = [...rawJobs].sort((a, b) =>
    a.status === b.status ? 0 : a.status === "closed" ? 1 : -1
  );

  return (
    <div className="p-4 lg:p-xl space-y-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-body-sm text-slate-500">{openCount} active requisition{openCount !== 1 ? "s" : ""}</p>
          <SearchBar placeholder="Search by role, department…" defaultValue={q} />
        </div>
        <a
          href="/jobs/new"
          className="bg-primary text-white px-5 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-primary-container transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Requisition
        </a>
      </div>

      <div className="space-y-md">
        {/* Table header — desktop only */}
        <div className="hidden lg:grid grid-cols-12 px-lg text-slate-500">
          <div className="col-span-5 font-label-caps text-label-caps">ROLE &amp; DEPARTMENT</div>
          <div className="col-span-2 font-label-caps text-label-caps text-center">VOLUME</div>
          <div className="col-span-3 font-label-caps text-label-caps">HIRE PROGRESS</div>
          <div className="col-span-2 font-label-caps text-label-caps text-right">ACTION</div>
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-xl bg-white border border-dashed border-slate-200 rounded-xl text-slate-400 space-y-3">
            <span className="material-symbols-outlined text-5xl block">work_outline</span>
            <p className="font-semibold text-on-surface">Aucun poste pour le moment</p>
            <p className="text-body-sm">Créez votre premier poste pour commencer à trier des candidats.</p>
            <a
              href="/jobs/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-container transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Créer un poste
            </a>
          </div>
        )}

        {jobs.map((job) => {
          const stageName  = job.stage;
          const appCount   = appCounts[job.id] ?? 0;
          const daysOpen   = Math.round((Date.now() - new Date(job.openedAt).getTime()) / 86_400_000);
          const openedLabel = daysOpen === 0 ? "aujourd'hui" : daysOpen === 1 ? "hier" : `il y a ${daysOpen}j`;
          const isClosed = job.status === "closed";
          const isFilled = filledJobIds.has(job.id);
          return (
            <div key={job.id} className={`tonal-card rounded-xl p-lg ${isClosed ? "opacity-60" : ""}`}>

              {/* Mobile card */}
              <div className="lg:hidden space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${job.iconBg}`}>
                      <span className="material-symbols-outlined text-base">{job.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-slate-900 truncate">{job.title}</p>
                        {isClosed && (
                          <span className="text-label-caps font-semibold px-1.5 py-0.5 rounded uppercase text-secondary bg-surface-container shrink-0">Clôturé</span>
                        )}
                        {isFilled && (
                          <span className="flex items-center gap-1 text-label-caps font-semibold px-1.5 py-0.5 rounded uppercase text-emerald-700 bg-emerald-100 shrink-0">
                            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                            Validé
                          </span>
                        )}
                      </div>
                      <p className="text-label-caps text-slate-500 truncate">{job.department} · {job.location} · <span className="text-slate-400">Ouvert {openedLabel}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="inline-flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                      <span className="material-symbols-outlined text-sm text-blue-600">group</span>
                      <span className="text-xs font-bold text-slate-700">{appCount}</span>
                    </div>
                    <a href={jobUrl(job.salt!, job.title)} className="text-primary">
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </a>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${job.progress}%` }} />
                </div>
                <div className="flex justify-between">
                  <span className="text-label-caps text-slate-500 truncate max-w-[60%]">{stageName}</span>
                  <span className="text-label-caps font-bold text-emerald-600">{job.progress}%</span>
                </div>
              </div>

              {/* Desktop row */}
              <div className="hidden lg:grid grid-cols-12 items-center">
                <div className="col-span-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded flex items-center justify-center ${job.iconBg}`}>
                    <span className="material-symbols-outlined">{job.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-h3 text-body-md font-bold text-slate-900">{job.title}</p>
                      {isClosed && (
                        <span className="text-label-caps font-semibold px-1.5 py-0.5 rounded uppercase text-secondary bg-surface-container">Clôturé</span>
                      )}
                      {isFilled && (
                        <span className="flex items-center gap-1 text-label-caps font-semibold px-1.5 py-0.5 rounded uppercase text-emerald-700 bg-emerald-100">
                          <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                          Validé
                        </span>
                      )}
                    </div>
                    <p className="text-label-caps text-slate-500">{job.department} · {job.location} · <span className="text-slate-400">Ouvert {openedLabel}</span></p>
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                    <span className="material-symbols-outlined text-sm text-blue-600">group</span>
                    <span className="text-sm font-bold text-slate-700">{appCount}</span>
                  </div>
                </div>
                <div className="col-span-3 pr-8">
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-sm">
                    <div className="h-full bg-emerald-500" style={{ width: `${job.progress}%` }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-label-caps font-bold text-slate-400 truncate max-w-[60%]">{stageName}</span>
                    <span className="text-label-caps font-bold text-emerald-600">{job.progress}%</span>
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

      {/* ── Templates ─────────────────────────────────────── */}
      <section className="space-y-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-h3 text-h3 text-on-surface">Templates de postes</h3>
            {templates.length > 0 && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-label-caps font-label-caps rounded-full">
                {templates.length}
              </span>
            )}
          </div>
          <a
            href="/jobs/new"
            className="text-sm text-slate-400 hover:text-primary flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Nouveau template
          </a>
        </div>
        <TemplateManager initialTemplates={templates} />
      </section>
    </div>
  );
}
