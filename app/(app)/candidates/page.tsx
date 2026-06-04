import { getApplications, getThresholds } from "@/lib/db";
import { scoreToFit } from "@/lib/thresholds";
import SearchBar from "@/components/SearchBar";
import CandidateApplicationSelector from "@/components/CandidateApplicationSelector";
import type { AppOption } from "@/components/CandidateApplicationSelector";
import SortSelect from "@/components/SortSelect";
import Link from "next/link";

const SORT_OPTIONS = [
  { value: "name",   label: "Nom A→Z" },
  { value: "recent", label: "Plus récents" },
  { value: "score",  label: "Meilleur score" },
] as const;

type SortKey = typeof SORT_OPTIONS[number]["value"];

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; tag?: string }>;
}) {
  const { q = "", sort = "recent", tag = "" } = await searchParams;

  const [allApplications, thresholds] = await Promise.all([
    getApplications(),
    getThresholds(),
  ]);

  // Group by candidate
  const byCandidate = new Map<
    number,
    { candidateId: number; name: string; role: string; company: string; location: string; tags: string[]; apps: AppOption[]; bestScore: number; appliedAt: Date }
  >();

  for (const app of allApplications) {
    const cid = app.candidate.id;
    if (!byCandidate.has(cid)) {
      byCandidate.set(cid, {
        candidateId: cid,
        name:        app.candidate.name,
        role:        app.candidate.role,
        company:     app.candidate.company,
        location:    app.candidate.location,
        tags:        (app.candidate.tags as string[] | null) ?? [],
        apps:        [],
        bestScore:   0,
        appliedAt:   app.appliedAt,
      });
    }
    const entry = byCandidate.get(cid)!;
    const fit   = scoreToFit(app.score, thresholds);
    entry.apps.push({ id: app.id, jobTitle: app.job.title, score: app.score, fit });
    if (app.score > entry.bestScore) entry.bestScore = app.score;
    if (app.appliedAt > entry.appliedAt) entry.appliedAt = app.appliedAt;
  }

  // Collect all unique tags for the filter bar
  const allTags = [...new Set(
    Array.from(byCandidate.values()).flatMap((g) => g.tags)
  )].sort();

  let groups = Array.from(byCandidate.values());

  // Filter
  if (q) {
    const term = q.toLowerCase();
    groups = groups.filter(
      (g) =>
        g.name.toLowerCase().includes(term) ||
        g.role.toLowerCase().includes(term) ||
        g.company.toLowerCase().includes(term)
    );
  }
  if (tag) {
    groups = groups.filter((g) => g.tags.includes(tag));
  }

  // Sort
  const s = (sort as SortKey);
  if (s === "name")   groups.sort((a, b) => a.name.localeCompare(b.name));
  if (s === "score")  groups.sort((a, b) => b.bestScore - a.bestScore);
  if (s === "recent") groups.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

  const keepParams: Record<string, string> = {};
  if (sort && sort !== "recent") keepParams.sort = sort;
  if (tag)  keepParams.tag  = tag;

  return (
    <div className="p-4 lg:p-xl max-w-5xl mx-auto space-y-xl">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-h2 text-h2 text-primary">Candidats</h2>
          <p className="text-body-sm text-slate-500 mt-0.5">
            {groups.length} candidat{groups.length !== 1 ? "s" : ""}
            {tag ? ` · tag : ${tag}` : ""}
            {q ? ` · "${q}"` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SearchBar placeholder="Rechercher…" defaultValue={q} keepParams={keepParams} />
          <SortSelect options={[...SORT_OPTIONS]} defaultValue={sort} />
          <Link
            href="/candidates/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-label-caps text-label-caps hover:bg-primary-container transition-colors shadow-sm whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Importer
          </Link>
        </div>
      </div>

      {/* ── Tag filter chips ──────────────────────────────── */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <a
            href={q ? `/candidates?q=${encodeURIComponent(q)}&sort=${sort}` : `/candidates?sort=${sort}`}
            className={[
              "px-3 py-1.5 rounded-full text-label-caps font-label-caps border whitespace-nowrap transition-colors",
              !tag ? "bg-primary text-white border-primary" : "bg-white border-slate-200 text-slate-500 hover:border-primary/40 hover:text-primary",
            ].join(" ")}
          >
            Tous
          </a>
          {allTags.map((t) => {
            const params = new URLSearchParams({ sort });
            if (q) params.set("q", q);
            params.set("tag", t);
            return (
              <a
                key={t}
                href={`/candidates?${params}`}
                className={[
                  "px-3 py-1.5 rounded-full text-label-caps font-label-caps border whitespace-nowrap transition-colors",
                  tag === t ? "bg-primary text-white border-primary" : "bg-white border-slate-200 text-slate-500 hover:border-primary/40 hover:text-primary",
                ].join(" ")}
              >
                {t}
              </a>
            );
          })}
        </div>
      )}

      {/* ── List ───────────────────────────────────────────── */}
      {groups.length === 0 ? (
        <div className="text-center py-xl bg-white border border-dashed border-slate-200 rounded-xl text-slate-400 space-y-3">
          <span className="material-symbols-outlined text-5xl block">person_search</span>
          <p>{q || tag ? "Aucun résultat pour ces filtres." : "Aucun candidat pour le moment."}</p>
          {!q && !tag && (
            <Link href="/candidates/new" className="inline-flex items-center gap-1 text-primary font-bold text-sm hover:underline">
              <span className="material-symbols-outlined text-sm">person_add</span>
              Importer un candidat
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-md">
          {groups.map((g) => {
            const initials = g.name.split(" ").map((n) => n[0]).join("");
            const multiApp = g.apps.length > 1;

            return (
              <div
                key={g.candidateId}
                className="bg-white border border-slate-200 rounded-xl p-lg flex flex-col sm:flex-row sm:items-center gap-md shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-md flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-body-md text-on-surface">{g.name}</span>
                      {multiApp && (
                        <span className="flex items-center gap-0.5 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-label-caps font-label-caps">
                          <span className="material-symbols-outlined text-xs">work_history</span>
                          {g.apps.length} candidatures
                        </span>
                      )}
                      {g.tags.slice(0, 2).map((t) => (
                        <a
                          key={t}
                          href={`/candidates?tag=${encodeURIComponent(t)}&sort=${sort}`}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-label-caps font-bold hover:bg-slate-200 transition-colors"
                        >
                          {t}
                        </a>
                      ))}
                    </div>
                    <p className="text-body-sm text-slate-500 truncate">
                      {g.role} · {g.company} · {g.location}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <CandidateApplicationSelector candidateId={g.candidateId} candidateName={g.name} applications={g.apps} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
