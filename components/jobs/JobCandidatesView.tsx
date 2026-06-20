"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import KanbanBoard from "./KanbanBoard";
import type { KanbanCard } from "./KanbanBoard";
import { candidateUrl, jobUrl } from "@/lib/slugify";

type Fit = "strong" | "medium" | "weak";

export type PlainApp = {
  id: number;
  candidateSalt: string;
  name: string;
  role: string;
  skills: string[];
  score: number;
  fit: Fit;
  stageIndex: number;
  appliedAt: string;
};

const PAGE_SIZE = 20;

const fitConfig = {
  strong: {
    label: "Strong Fit",
    bar:   "bg-emerald-500",
    chip:  "bg-emerald-100 text-emerald-900",
    score: "bg-primary/10 text-primary border border-primary/20",
  },
  medium: {
    label: "Medium Fit",
    bar:   "bg-amber-400",
    chip:  "bg-amber-100 text-amber-900",
    score: "bg-slate-100 text-slate-600 border border-slate-200",
  },
  weak: {
    label: "Weak Fit",
    bar:   "bg-slate-300",
    chip:  "bg-slate-100 text-slate-600",
    score: "bg-slate-50 text-slate-500 border border-slate-200",
  },
} as const;

export default function JobCandidatesView({
  allApps,
  stages,
  requirements,
  jobId,
  jobSalt,
  jobTitle,
  strongCount,
  totalApplications,
  currentStageIndex,
}: {
  allApps: PlainApp[];
  stages: string[];
  requirements: string[];
  jobId: number;
  jobSalt: string;
  jobTitle: string;
  strongCount: number;
  totalApplications: number;
  currentStageIndex: number;
}) {
  const router = useRouter();

  const [view, setView]       = useState<"list" | "kanban">("list");
  const [q, setQ]             = useState("");
  const [sort, setSort]       = useState("score");
  const [page, setPage]       = useState(1);
  const [compareA, setCompareA] = useState<number | null>(null);

  function handleCompare(appId: number) {
    if (compareA === null) {
      setCompareA(appId);
    } else if (compareA === appId) {
      setCompareA(null);
    } else {
      router.push(`${jobUrl(jobSalt, jobTitle)}/compare?a=${compareA}&b=${appId}`);
      setCompareA(null);
    }
  }

  // Filter + sort (list view only — kanban shows all)
  const filtered = useMemo(() => {
    let res = allApps;
    if (q) {
      const term = q.toLowerCase();
      res = res.filter((a) => a.name.toLowerCase().includes(term) || a.role.toLowerCase().includes(term));
    }
    const sorted = [...res];
    if      (sort === "name")   sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "recent") sorted.sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
    else                        sorted.sort((a, b) => b.score - a.score);
    return sorted;
  }, [allApps, q, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const groups = (["strong", "medium", "weak"] as const).map((fit) => ({
    fit, ...fitConfig[fit],
    items: paginated.filter((a) => a.fit === fit),
  }));

  const KANBAN_LIMIT = 100;
  const kanbanSource = [...allApps].sort((a, b) => b.score - a.score).slice(0, KANBAN_LIMIT);
  const kanbanHidden = Math.max(0, allApps.length - KANBAN_LIMIT);

  const kanbanCards: KanbanCard[] = kanbanSource.map((a) => ({
    appId:         a.id,
    candidateSalt: a.candidateSalt,
    name:          a.name,
    score:         a.score,
    fit:           a.fit,
    stageIndex:    a.stageIndex,
  }));

  function switchView(next: "list" | "kanban") {
    setView(next);
    setPage(1);
  }

  return (
    <div className="space-y-lg">

      {/* ── Filter bar ──────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative h-9">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-sm pointer-events-none">search</span>
            <input
              type="search"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Rechercher un candidat…"
              className="h-full pl-9 pr-3 py-0 border border-outline-variant rounded-lg text-body-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary w-52"
            />
          </div>
          {view === "list" && (
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="h-9 border border-outline-variant rounded-lg px-3 py-0 text-body-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
            >
              <option value="score">Meilleur score</option>
              <option value="name">Nom A→Z</option>
              <option value="recent">Plus récents</option>
            </select>
          )}
          <span className="text-label-caps text-secondary whitespace-nowrap">
            {view === "list" ? filtered.length : totalApplications} candidat{(view === "list" ? filtered.length : totalApplications) !== 1 ? "s" : ""}
            {view === "list" && q ? ` · "${q}"` : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {totalApplications > 0 && (
            <a
              href={`/api/candidates/export?jobId=${jobId}`}
              download
              className="h-9 flex items-center gap-2 px-3 bg-white border border-outline-variant text-on-surface-variant rounded-lg text-sm font-semibold hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-sm">download</span>CSV
            </a>
          )}
          <Link
            href="/candidates/new"
            className="h-9 flex items-center gap-2 px-4 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>Importer
          </Link>
          <div className="h-9 flex rounded-lg border border-outline-variant overflow-hidden">
            <button type="button" onClick={() => switchView("list")} className={`h-full px-2 flex items-center justify-center transition-colors ${view === "list" ? "bg-primary text-white" : "bg-white text-secondary hover:text-primary"}`} title="Vue liste">
              <span className="material-symbols-outlined text-sm">view_list</span>
            </button>
            <button type="button" onClick={() => switchView("kanban")} className={`h-full px-2 flex items-center justify-center transition-colors ${view === "kanban" ? "bg-primary text-white" : "bg-white text-secondary hover:text-primary"}`} title="Vue kanban">
              <span className="material-symbols-outlined text-sm">view_kanban</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Empty state ─────────────────────────────────── */}
      {totalApplications === 0 && (
        <div className="bg-white border border-outline-variant rounded-xl p-xl text-center text-secondary">
          <span className="material-symbols-outlined text-4xl block mb-2">person_search</span>
          <p className="text-body-sm">Aucun candidat pour ce poste.</p>
          <Link href="/candidates/new" className="mt-md inline-flex items-center gap-1 text-primary font-bold text-sm hover:underline">
            <span className="material-symbols-outlined text-sm">person_add</span>
            Importer un candidat
          </Link>
        </div>
      )}

      {/* ── Views ───────────────────────────────────────── */}
      {totalApplications > 0 && (
        <div key={view} className="animate-fade-in">

          {/* Kanban */}
          {view === "kanban" && (
            <div className="space-y-sm">
              {kanbanHidden > 0 && (
                <p className="text-label-caps text-secondary">
                  Top {KANBAN_LIMIT} candidats par score affichés · {kanbanHidden} non affichés
                </p>
              )}
              <KanbanBoard stages={stages} initialCards={kanbanCards} currentStageIndex={currentStageIndex} jobSalt={jobSalt} jobTitle={jobTitle} />
            </div>
          )}

          {/* List + sidebar */}
          {view === "list" && (
            <div className="flex flex-col lg:flex-row gap-xl">
              <section className="flex-1 space-y-lg min-w-0">

                {filtered.length === 0 && q && (
                  <p className="text-body-sm text-secondary py-md">Aucun résultat pour « {q} ».</p>
                )}

                <div className="space-y-xl">
                  {compareA !== null && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-body-sm text-on-surface">
                      <span className="material-symbols-outlined text-primary">compare_arrows</span>
                      <span className="flex-1">1 candidat sélectionné — cliquez sur <strong>Comparer</strong> d&apos;un deuxième pour lancer la comparaison.</span>
                      <button type="button" onClick={() => setCompareA(null)} className="text-primary hover:text-primary-container font-semibold text-label-caps">
                        Annuler
                      </button>
                    </div>
                  )}

                  {groups.filter((g) => g.items.length > 0).map((group) => (
                    <div key={group.fit}>
                      <div className="flex items-center gap-2 mb-md">
                        <div className={`w-1 h-6 rounded-full ${group.bar}`} />
                        <h3 className="font-h3 text-h3">{group.label}</h3>
                        <span className="text-secondary text-label-caps ml-1">
                          {filtered.filter((a) => a.fit === group.fit).length}
                        </span>
                      </div>
                      <div className="space-y-md">
                        {group.items.map((a) => {
                          const isSelectedForCompare = compareA === a.id;
                          return (

                            <div key={a.id} className="relative group/card">
                              <Link
                                href={candidateUrl(a.candidateSalt, a.name, jobSalt, jobTitle)}
                                className={`tonal-card p-4 lg:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 block ${isSelectedForCompare ? "ring-2 ring-primary/30" : ""}`}
                              >
                                <div className="flex items-center gap-3 min-w-0 sm:w-1/3">
                                  <div className="w-10 h-10 rounded-full bg-surface-container flex-shrink-0 flex items-center justify-center text-on-surface-variant font-bold text-sm">
                                    {a.name.split(" ").map((n) => n[0]).join("")}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-semibold text-body-md text-on-surface truncate">{a.name}</h4>
                                    <p className="text-body-sm text-on-surface-variant truncate">{a.role}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2 flex-wrap sm:flex-1 sm:px-3">
                                  {a.skills.length > 0
                                    ? a.skills.slice(0, 3).map((skill) => (
                                        <span key={skill} className={`px-2 py-0.5 text-label-caps font-label-caps rounded ${group.chip}`}>{skill}</span>
                                      ))
                                    : <span className="text-body-sm text-secondary">Aucune compétence.</span>
                                  }
                                </div>
                                <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0 pr-8">
                                  {a.stageIndex === currentStageIndex && (
                                    <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-label-caps font-label-caps whitespace-nowrap">
                                      <span className="material-symbols-outlined text-[10px]" style={{ fontSize: "10px" }}>radio_button_checked</span>
                                      Même étape
                                    </span>
                                  )}
                                  <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${group.score}`}>
                                    <span className="material-symbols-outlined text-sm">bolt</span>
                                    <span className="font-label-caps text-label-caps">{a.score}%</span>
                                  </div>
                                  <span className="material-symbols-outlined text-secondary">chevron_right</span>
                                </div>
                              </Link>
                              <button type="button" onClick={() => handleCompare(a.id)} title={isSelectedForCompare ? "Désélectionner" : compareA !== null ? "Comparer avec ce candidat" : "Sélectionner pour comparer"} className={["absolute top-3 right-3 p-1.5 rounded-lg border transition-all", isSelectedForCompare ? "bg-primary text-white border-primary" : compareA !== null ? "bg-surface-container-low text-primary border-outline-variant hover:bg-surface-container" : "opacity-0 group-hover/card:opacity-100 bg-white text-secondary border-outline-variant hover:text-primary hover:border-primary/40"].join(" ")}>
                                <span className="material-symbols-outlined text-sm">compare_arrows</span>
                              </button>
                            </div>

                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-md border-t border-outline-variant">
                    <span className="text-label-caps text-secondary">
                      Page {safePage} / {totalPages}
                    </span>
                    <div className="flex gap-2">
                      {safePage > 1 && (
                        <button
                          type="button"
                          onClick={() => setPage(safePage - 1)}
                          className="px-3 py-1.5 rounded-lg border border-outline-variant text-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                        >← Précédent</button>
                      )}
                      {safePage < totalPages && (
                        <button
                          type="button"
                          onClick={() => setPage(safePage + 1)}
                          className="px-3 py-1.5 rounded-lg border border-outline-variant text-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                        >Suivant →</button>
                      )}
                    </div>
                  </div>
                )}
              </section>

              {/* Sidebar */}

              <aside className="w-full lg:w-72 space-y-lg lg:sticky lg:top-24 lg:h-fit shrink-0">
                <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
                  <h4 className="font-label-caps text-label-caps text-primary uppercase tracking-[0.05em] mb-md">
                    Exigences
                  </h4>
                  {requirements.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {requirements.map((r) => (
                        <span key={r} className="px-2 py-1 bg-surface-container text-on-surface-variant text-label-caps rounded">
                          {r}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-body-sm text-secondary">Aucune compétence définie.</p>
                  )}
                </div>

                <div className="bg-primary text-white rounded-xl p-lg">
                  <div className="flex items-center gap-2 mb-sm">
                    <span className="material-symbols-outlined text-primary-fixed-dim">auto_awesome</span>
                    <h4 className="text-body-md font-bold">Insight</h4>
                  </div>
                  <p className="text-body-sm text-primary-fixed-dim leading-relaxed">
                    {strongCount} strong fit{strongCount !== 1 ? "s" : ""} sur {totalApplications} candidat{totalApplications !== 1 ? "s" : ""}.
                    {strongCount > 0 && totalApplications > 0
                      ? ` Taux de qualification : ${Math.round((strongCount / totalApplications) * 100)}%.`
                      : ""}
                  </p>
                </div>
              </aside>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
