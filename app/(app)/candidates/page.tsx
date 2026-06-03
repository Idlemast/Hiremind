import { getApplications, getThresholds } from "@/lib/db";
import { scoreToFit } from "@/lib/thresholds";
import SearchBar from "@/components/SearchBar";
import CandidateApplicationSelector from "@/components/CandidateApplicationSelector";
import type { AppOption } from "@/components/CandidateApplicationSelector";
import Link from "next/link";

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  const [allApplications, thresholds] = await Promise.all([
    getApplications(),
    getThresholds(),
  ]);

  // Group applications by candidate
  const byCandidate = new Map<
    number,
    { candidateId: number; name: string; role: string; company: string; location: string; tags: string[]; apps: AppOption[] }
  >();

  for (const app of allApplications) {
    const cid = app.candidate.id;
    if (!byCandidate.has(cid)) {
      byCandidate.set(cid, {
        candidateId: cid,
        name:     app.candidate.name,
        role:     app.candidate.role,
        company:  app.candidate.company,
        location: app.candidate.location,
        tags:     (app.candidate.tags as string[] | null) ?? [],
        apps: [],
      });
    }
    byCandidate.get(cid)!.apps.push({
      id:       app.id,
      jobTitle: app.job.title,
      score:    app.score,
      fit:      scoreToFit(app.score, thresholds),
    });
  }

  let groups = Array.from(byCandidate.values());

  if (q) {
    const term = q.toLowerCase();
    groups = groups.filter(
      (g) =>
        g.name.toLowerCase().includes(term) ||
        g.role.toLowerCase().includes(term) ||
        g.company.toLowerCase().includes(term)
    );
  }

  return (
    <div className="p-4 lg:p-xl max-w-5xl mx-auto space-y-xl">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-h2 text-h2 text-primary">Candidats</h2>
          <p className="text-body-sm text-slate-500 mt-0.5">
            {groups.length} candidat{groups.length !== 1 ? "s" : ""}
            {q ? ` · filtrés sur "${q}"` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar placeholder="Rechercher…" defaultValue={q} />
          <Link
            href="/candidates/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-label-caps text-label-caps hover:bg-primary-container transition-colors shadow-sm whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Importer
          </Link>
        </div>
      </div>

      {/* ── List ───────────────────────────────────────────── */}
      {groups.length === 0 ? (
        <div className="text-center py-xl bg-white border border-dashed border-slate-200 rounded-xl text-slate-400 space-y-3">
          <span className="material-symbols-outlined text-5xl block">person_search</span>
          <p>{q ? `Aucun résultat pour "${q}".` : "Aucun candidat pour le moment."}</p>
          {!q && (
            <Link
              href="/candidates/new"
              className="inline-flex items-center gap-1 text-primary font-bold text-sm hover:underline"
            >
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
                {/* Avatar + info */}
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
                      {g.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-label-caps font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-body-sm text-slate-500 truncate">
                      {g.role} · {g.company} · {g.location}
                    </p>
                  </div>
                </div>

                {/* Application selector */}
                <div className="shrink-0">
                  <CandidateApplicationSelector
                    candidateId={g.candidateId}
                    applications={g.apps}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
