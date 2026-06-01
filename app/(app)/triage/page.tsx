import Link from "next/link";
import { getCandidates, getThresholds, getJobs } from "@/lib/db";
import SearchBar from "@/components/SearchBar";
import { scoreToFit } from "@/lib/thresholds";

const fitConfig = {
  strong: {
    label: "Strong Fit",
    subtitle: "High alignment with core competencies",
    bar: "bg-emerald-500",
    border: "border-l-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    score: "bg-primary-container/10 text-primary border border-primary/20",
    opacity: "",
  },
  medium: {
    label: "Medium Fit",
    subtitle: "Solid candidates with slight skill gaps",
    bar: "bg-amber-400",
    border: "border-l-amber-400",
    chip: "bg-amber-50 text-amber-700 border border-amber-100",
    score: "bg-slate-100 text-slate-500 border border-slate-200",
    opacity: "opacity-90",
  },
  weak: {
    label: "Weak Fit",
    subtitle: "Missing mandatory domain experience",
    bar: "bg-slate-300",
    border: "border-l-slate-300",
    chip: "bg-slate-50 text-slate-400 border border-slate-100",
    score: "bg-slate-50 text-slate-400 border border-slate-100",
    opacity: "opacity-70",
  },
} as const;

export default async function TriagePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; jobId?: string }>;
}) {
  const { q = "", jobId } = await searchParams;
  const selectedJobId     = jobId ? Number(jobId) : undefined;

  const [allCandidates, thresholds, jobs] = await Promise.all([
    getCandidates(selectedJobId),
    getThresholds(),
    getJobs(),
  ]);

  const selectedJob = selectedJobId ? jobs.find((j) => j.id === selectedJobId) : null;

  const candidates = (q
    ? allCandidates.filter((c) => {
        const term = q.toLowerCase();
        return c.name.toLowerCase().includes(term) || c.role.toLowerCase().includes(term);
      })
    : allCandidates
  ).map((c) => ({ ...c, fit: scoreToFit(c.score, thresholds) }));

  const groups = (["strong", "medium", "weak"] as const).map((fit) => ({
    fit,
    ...fitConfig[fit],
    items: candidates.filter((c) => c.fit === fit),
  }));

  // Build keep-params for SearchBar (preserve jobId when typing in search)
  const keepParams: Record<string, string> = {};
  if (selectedJobId) keepParams.jobId = String(selectedJobId);

  // Requirements for sidebar (selected job or empty)
  const requirements = (selectedJob?.requirements as string[] | null) ?? [];

  return (
    <div className="p-xl flex gap-xl">
      <section className="flex-1 space-y-xl min-w-0">

        {/* ── Job filter chips ───────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={q ? `/triage?q=${encodeURIComponent(q)}` : "/triage"}
            className={[
              "px-4 py-2 rounded-full font-label-caps text-label-caps border transition-colors whitespace-nowrap",
              !selectedJobId
                ? "bg-primary text-white border-primary"
                : "bg-white border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary",
            ].join(" ")}
          >
            Tous les postes
          </a>
          {jobs.map((job) => {
            const active = job.id === selectedJobId;
            const href   = `/triage?jobId=${job.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
            return (
              <a
                key={job.id}
                href={href}
                className={[
                  "flex items-center gap-2 px-4 py-2 rounded-full font-label-caps text-label-caps border transition-colors whitespace-nowrap",
                  active
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary",
                ].join(" ")}
              >
                <span className={`w-2 h-2 rounded-full ${active ? "bg-white" : "bg-slate-300"}`} />
                {job.title}
              </a>
            );
          })}
        </div>

        {/* ── Search + fit chips + CTA ───────────────────── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <SearchBar
              placeholder="Rechercher un candidat…"
              defaultValue={q}
              keepParams={keepParams}
            />
            <span className="font-label-caps text-label-caps text-slate-400">
              {candidates.length} candidat{candidates.length > 1 ? "s" : ""}
              {selectedJob ? ` · ${selectedJob.title}` : ""}
            </span>
          </div>
          <a
            href="/candidates/new"
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-label-caps text-label-caps hover:bg-primary-container transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Import Candidate
          </a>
        </div>

        {/* ── Candidate groups ───────────────────────────── */}
        <div className="space-y-xl">
          {candidates.length === 0 && (
            <div className="text-center py-xl text-slate-400">
              <span className="material-symbols-outlined text-4xl block mb-2">person_search</span>
              <p>Aucun candidat{selectedJob ? ` pour ${selectedJob.title}` : ""}.</p>
            </div>
          )}

          {groups.filter((g) => g.items.length > 0).map((group) => (
            <div key={group.fit} className={group.opacity}>
              <div className="flex items-center gap-2 mb-md">
                <div className={`w-1 h-6 rounded-full ${group.bar}`} />
                <h3 className="font-h3 text-h3">{group.label}</h3>
                <span className="text-slate-400 font-body-sm ml-2">{group.subtitle}</span>
              </div>

              <div className="space-y-md">
                {group.items.map((candidate) => (
                  <Link
                    key={candidate.id}
                    href={`/candidates/${candidate.id}`}
                    className={`bg-white border border-slate-200 p-6 rounded-xl flex items-center justify-between transition-all duration-200 shadow-sm border-l-4 ${group.border} hover:shadow-md`}
                  >
                    <div className="flex items-center gap-4 w-1/4 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-500 font-bold">
                        {candidate.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-h3 text-body-md text-on-surface truncate">{candidate.name}</h4>
                        <p className="text-body-sm text-slate-500 truncate">{candidate.role}</p>
                        {!selectedJobId && (
                          <p className="text-label-caps text-slate-400 truncate mt-0.5">
                            {candidate.job.title}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 px-8 flex gap-2 flex-wrap">
                      {(candidate.skills as string[]).length > 0 ? (
                        (candidate.skills as string[]).slice(0, 3).map((skill) => (
                          <span key={skill} className={`px-3 py-1 font-label-caps text-label-caps rounded-full ${group.chip}`}>
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-body-sm text-slate-400">Limited experience detected.</span>
                      )}
                    </div>

                    <div className="flex items-center gap-12">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${group.score}`}>
                        <span className="material-symbols-outlined text-sm">bolt</span>
                        <span className="font-label-caps text-label-caps">{candidate.score}% Clarity</span>
                      </div>
                      <span className="material-symbols-outlined text-slate-400">
                        {candidate.fit === "weak" ? "visibility_off" : "more_vert"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className="w-80 space-y-lg sticky top-24 h-fit shrink-0">

        {/* Job requirements */}
        <div className="bg-white border border-slate-200 rounded-xl p-lg shadow-sm">
          <h4 className="font-label-caps text-label-caps text-primary uppercase tracking-widest mb-md">
            {selectedJob ? selectedJob.title : "Requirement Signals"}
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
            <p className="text-body-sm text-slate-400">
              {selectedJob
                ? "Aucune compétence définie pour ce poste."
                : "Sélectionnez un poste pour voir ses exigences."}
            </p>
          )}
        </div>

        {/* AI Insight */}
        <div className="bg-blue-900 text-white rounded-xl p-lg shadow-lg">
          <div className="flex items-center gap-2 mb-sm">
            <span className="material-symbols-outlined text-blue-300">auto_awesome</span>
            <h4 className="font-h3 text-body-md font-bold">AI Insight</h4>
          </div>
          <p className="text-body-sm text-blue-100 leading-relaxed">
            {candidates.filter((c) => c.fit === "strong").length} strong fit{candidates.filter((c) => c.fit === "strong").length !== 1 ? "s" : ""} sur {candidates.length} candidat{candidates.length !== 1 ? "s" : ""}
            {selectedJob ? ` pour ${selectedJob.title}` : " au total"}.
          </p>
        </div>

        {/* Quick links to other jobs */}
        {selectedJobId && jobs.length > 1 && (
          <div className="bg-white border border-slate-200 rounded-xl p-lg shadow-sm">
            <h4 className="font-label-caps text-label-caps text-slate-400 uppercase tracking-widest mb-md">
              Autres postes
            </h4>
            <div className="space-y-1">
              {jobs.filter((j) => j.id !== selectedJobId).map((job) => (
                <a
                  key={job.id}
                  href={`/triage?jobId=${job.id}`}
                  className="flex items-center justify-between py-1.5 text-body-sm text-slate-600 hover:text-primary transition-colors group"
                >
                  <span className="truncate">{job.title}</span>
                  <span className="material-symbols-outlined text-sm text-slate-300 group-hover:text-primary transition-colors">
                    chevron_right
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
