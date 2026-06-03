import { getJobById, getApplications, getThresholds } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import StagePipeline from "@/components/StagePipeline";
import SaveAsTemplateButton from "@/components/SaveAsTemplateButton";
import DeleteJobButton from "@/components/DeleteJobButton";
import ArchiveJobButton from "@/components/ArchiveJobButton";
import SearchBar from "@/components/SearchBar";
import { scoreToFit, fitToDecision, DECISION_META, getCommTemplates } from "@/lib/thresholds";
import { DEFAULT_STAGES } from "@/lib/stages";

const fitConfig = {
  strong: {
    label: "Strong Fit",
    bar: "bg-emerald-500", border: "border-l-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    score: "bg-primary-container/10 text-primary border border-primary/20",
    opacity: "",
  },
  medium: {
    label: "Medium Fit",
    bar: "bg-amber-400", border: "border-l-amber-400",
    chip: "bg-amber-50 text-amber-700 border border-amber-100",
    score: "bg-slate-100 text-slate-500 border border-slate-200",
    opacity: "opacity-90",
  },
  weak: {
    label: "Weak Fit",
    bar: "bg-slate-300", border: "border-l-slate-300",
    chip: "bg-slate-50 text-slate-400 border border-slate-100",
    score: "bg-slate-50 text-slate-400 border border-slate-100",
    opacity: "opacity-70",
  },
} as const;

const PAGE_SIZE = 20;

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { id }        = await params;
  const { q = "", page } = await searchParams;
  const jobId         = Number(id);
  const currentPage   = Math.max(1, Number(page) || 1);

  const [job, allApplications, thresholds] = await Promise.all([
    getJobById(jobId),
    getApplications(jobId),
    getThresholds(),
  ]);
  if (!job) notFound();

  const rawStages    = job.stages as string[] | null | undefined;
  const stages       = rawStages?.length ? rawStages : DEFAULT_STAGES;
  const stageIndex   = job.currentStageIndex ?? 0;
  const currentStage = stages[stageIndex] ?? job.stage;
  const requirements = (job.requirements as string[] | null) ?? [];

  const applications = (q
    ? allApplications.filter((a) => {
        const term = q.toLowerCase();
        return a.candidate.name.toLowerCase().includes(term)
            || a.candidate.role.toLowerCase().includes(term);
      })
    : allApplications
  ).map((a) => ({ ...a, fit: scoreToFit(a.score, thresholds) }));

  const totalCount  = applications.length;
  const totalPages  = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginated   = applications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const strongCount = applications.filter((a) => a.fit === "strong").length;
  const mediumCount = applications.filter((a) => a.fit === "medium").length;
  const weakCount   = applications.filter((a) => a.fit === "weak").length;

  const groups = (["strong", "medium", "weak"] as const).map((fit) => ({
    fit, ...fitConfig[fit],
    items: paginated.filter((a) => a.fit === fit),
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
              {(job as any).budget && <span className="ml-2 text-slate-400">· {(job as any).budget}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Link href={`/jobs/${jobId}/edit`}
            className="p-2 sm:px-3 sm:py-2 bg-white border border-outline-variant text-on-surface-variant font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-sm"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            <span className="hidden sm:inline">Modifier</span>
          </Link>
          <ArchiveJobButton jobId={jobId} status={(job as any).status ?? "open"} />
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
              <Link href={`/jobs/${jobId}/advance`}
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

      {/* ── Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        {[
          { label: "Candidats",  value: allApplications.length, icon: "group",        color: "text-primary" },
          { label: "Strong Fit", value: strongCount,             icon: "check_circle", color: "text-emerald-600" },
          { label: "À évaluer",  value: mediumCount,             icon: "pending",      color: "text-amber-600" },
          { label: "Faible Fit", value: weakCount,               icon: "cancel",       color: "text-slate-400" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm text-center">
            <span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span>
            <p className="font-h1 text-2xl font-bold text-on-surface mt-1">{value}</p>
            <p className="text-label-caps text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Candidates + sidebar ──────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-xl">
        <section className="flex-1 space-y-lg min-w-0">

          {/* Search + export */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <SearchBar placeholder="Rechercher un candidat…" defaultValue={q} />
              <span className="text-label-caps text-slate-400 whitespace-nowrap">
                {totalCount} candidat{totalCount !== 1 ? "s" : ""}
                {q ? ` · "${q}"` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {allApplications.length > 0 && (
                <a href={`/api/candidates/export?jobId=${jobId}`} download
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-outline-variant text-on-surface-variant rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  CSV
                </a>
              )}
              <Link href="/candidates/new"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                Importer
              </Link>
            </div>
          </div>

          {/* Empty state */}
          {allApplications.length === 0 && (
            <div className="bg-white border border-outline-variant rounded-xl p-xl text-center text-slate-400">
              <span className="material-symbols-outlined text-4xl block mb-2">person_search</span>
              <p>Aucun candidat pour ce poste.</p>
              <Link href="/candidates/new"
                className="mt-md inline-flex items-center gap-1 text-primary font-bold text-sm hover:underline"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                Importer un candidat
              </Link>
            </div>
          )}

          {/* Candidate groups */}
          <div className="space-y-xl">
            {groups.filter((g) => g.items.length > 0).map((group) => (
              <div key={group.fit} className={group.opacity}>
                <div className="flex items-center gap-2 mb-md">
                  <div className={`w-1 h-6 rounded-full ${group.bar}`} />
                  <h3 className="font-h3 text-h3">{group.label}</h3>
                  <span className="text-slate-400 font-body-sm text-label-caps ml-1">
                    {applications.filter((a) => a.fit === group.fit).length}
                  </span>
                </div>
                <div className="space-y-md">
                  {group.items.map((a) => (
                    <Link key={a.id}
                      href={`/candidates/${a.candidate.id}?appId=${a.id}`}
                      className={`bg-white border border-slate-200 p-4 lg:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all duration-200 shadow-sm border-l-4 ${group.border} hover:shadow-md`}
                    >
                      <div className="flex items-center gap-3 min-w-0 sm:w-1/3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-500 font-bold text-sm">
                          {a.candidate.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-body-md text-on-surface truncate">{a.candidate.name}</h4>
                          <p className="text-body-sm text-slate-500 truncate">{a.candidate.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap sm:flex-1 sm:px-3">
                        {(a.candidate.skills as string[]).length > 0
                          ? (a.candidate.skills as string[]).slice(0, 3).map((skill) => (
                              <span key={skill} className={`px-2 py-0.5 text-label-caps font-label-caps rounded-full ${group.chip}`}>
                                {skill}
                              </span>
                            ))
                          : <span className="text-body-sm text-slate-400">Aucune compétence.</span>
                        }
                      </div>
                      <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${group.score}`}>
                          <span className="material-symbols-outlined text-sm">bolt</span>
                          <span className="font-label-caps text-label-caps">{a.score}%</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-md border-t border-slate-100">
              <span className="text-label-caps text-slate-400">
                Page {currentPage} / {totalPages}
              </span>
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <a href={`/jobs/${jobId}?${new URLSearchParams({ ...(q && { q }), page: String(currentPage - 1) })}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:border-primary hover:text-primary transition-colors"
                  >← Précédent</a>
                )}
                {currentPage < totalPages && (
                  <a href={`/jobs/${jobId}?${new URLSearchParams({ ...(q && { q }), page: String(currentPage + 1) })}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:border-primary hover:text-primary transition-colors"
                  >Suivant →</a>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside className="w-full lg:w-72 space-y-lg lg:sticky lg:top-24 lg:h-fit shrink-0">

          {/* Requirements */}
          <div className="bg-white border border-slate-200 rounded-xl p-lg shadow-sm">
            <h4 className="font-label-caps text-label-caps text-primary uppercase tracking-widest mb-md">
              Exigences
            </h4>
            {requirements.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {requirements.map((r) => (
                  <span key={r} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-label-caps rounded">
                    {r}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-body-sm text-slate-400">Aucune compétence définie.</p>
            )}
          </div>

          {/* Insight */}
          <div className="bg-blue-900 text-white rounded-xl p-lg shadow-lg">
            <div className="flex items-center gap-2 mb-sm">
              <span className="material-symbols-outlined text-blue-300">auto_awesome</span>
              <h4 className="font-h3 text-body-md font-bold">Insight</h4>
            </div>
            <p className="text-body-sm text-blue-100 leading-relaxed">
              {strongCount} strong fit{strongCount !== 1 ? "s" : ""} sur {allApplications.length} candidat{allApplications.length !== 1 ? "s" : ""}.
              {strongCount > 0 && allApplications.length > 0
                ? ` Taux de qualification : ${Math.round((strongCount / allApplications.length) * 100)}%.`
                : ""}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
