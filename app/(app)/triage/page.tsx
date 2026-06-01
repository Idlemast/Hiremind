import Link from "next/link";
import { getCandidates } from "@/lib/db";
import SearchBar from "@/components/SearchBar";

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
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const allCandidates = await getCandidates();

  const candidates = q
    ? allCandidates.filter((c) => {
        const term = q.toLowerCase();
        return (
          c.name.toLowerCase().includes(term) ||
          c.role.toLowerCase().includes(term)
        );
      })
    : allCandidates;

  const groups = (["strong", "medium", "weak"] as const).map((fit) => ({
    fit,
    ...fitConfig[fit],
    items: candidates.filter((c) => c.fit === fit),
  }));

  return (
    <div className="p-xl flex gap-xl">
      <section className="flex-1 space-y-xl">

        {/* Filter chips + CTA */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <SearchBar placeholder="Rechercher un candidat…" defaultValue={q} />
            <button className="px-4 py-2 bg-primary text-white rounded-full font-label-caps text-label-caps">
              Tous ({candidates.length})
            </button>
            {groups.map((g) => (
              <button key={g.fit} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full font-label-caps text-label-caps hover:bg-slate-50">
                {g.label} ({g.items.length})
              </button>
            ))}
          </div>
          <a
            href="/candidates/new"
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-label-caps text-label-caps hover:bg-primary-container transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Import Candidate
          </a>
        </div>

        {/* Candidate groups */}
        <div className="space-y-xl">
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
                    <div className="flex items-center gap-4 w-1/4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-500 font-bold">
                        {candidate.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <h4 className="font-h3 text-body-md text-on-surface">{candidate.name}</h4>
                        <p className="text-body-sm text-slate-500">{candidate.role}</p>
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

      {/* Sidebar */}
      <aside className="w-80 space-y-lg sticky top-24 h-fit shrink-0">
        <div className="bg-white border border-slate-200 rounded-xl p-lg shadow-sm">
          <h4 className="font-label-caps text-label-caps text-primary uppercase tracking-widest mb-md">
            Requirement Signals
          </h4>
          <div className="space-y-md">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-body-sm font-semibold mb-1">Mandatory Competencies</p>
              <div className="flex flex-wrap gap-2">
                {["Design Systems", "Complex SaaS", "Stakeholder Mgmt"].map((s) => (
                  <span key={s} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-label-caps rounded">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-900 text-white rounded-xl p-lg shadow-lg">
          <div className="flex items-center gap-2 mb-sm">
            <span className="material-symbols-outlined text-blue-300">auto_awesome</span>
            <h4 className="font-h3 text-body-md font-bold">AI Insight</h4>
          </div>
          <p className="text-body-sm text-blue-100 leading-relaxed">
            {candidates.filter(c => c.fit === "strong").length} strong fits out of {candidates.length} total candidates.
          </p>
        </div>
      </aside>
    </div>
  );
}
