import { getCandidates, getJobs, getThresholds } from "@/lib/db";
import { computeGapFrequency, computeFitDistribution } from "@/lib/stats";
import { scoreToFit } from "@/lib/thresholds";

export default async function StatsPage() {
  const [allCandidates, jobs, thresholds] = await Promise.all([
    getCandidates(),
    getJobs(),
    getThresholds(),
  ]);

  const gaps         = computeGapFrequency(allCandidates);
  const distribution = computeFitDistribution(
    allCandidates,
    jobs,
    (score) => scoreToFit(score, thresholds)
  );

  const total       = allCandidates.length;
  const strongCount = allCandidates.filter((c) => scoreToFit(c.score, thresholds) === "strong").length;
  const mediumCount = allCandidates.filter((c) => scoreToFit(c.score, thresholds) === "medium").length;
  const weakCount   = allCandidates.filter((c) => scoreToFit(c.score, thresholds) === "weak").length;
  const avgScore    = total > 0 ? Math.round(allCandidates.reduce((s, c) => s + c.score, 0) / total) : 0;

  return (
    <div className="p-4 lg:p-xl max-w-6xl mx-auto space-y-xl">

      <div>
        <h2 className="font-h2 text-h2 text-primary">Statistiques</h2>
        <p className="text-body-sm text-slate-500 mt-1">Vue globale du pipeline de recrutement.</p>
      </div>

      {/* ── KPIs ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        {[
          { label: "Candidats",     value: total,        color: "text-primary",    ribbon: "bg-blue-500" },
          { label: "Strong Fit",    value: strongCount,  color: "text-emerald-600", ribbon: "bg-emerald-500" },
          { label: "À évaluer",     value: mediumCount,  color: "text-amber-600",  ribbon: "bg-amber-400" },
          { label: "Score moyen",   value: `${avgScore}%`, color: "text-primary",  ribbon: "bg-slate-400" },
        ].map(({ label, value, color, ribbon }) => (
          <div key={label} className="tonal-card rounded-xl p-lg relative overflow-hidden flex flex-col justify-between h-28">
            <div className={`status-ribbon ${ribbon}`} />
            <p className="font-label-caps text-label-caps text-secondary uppercase">{label}</p>
            <h3 className={`font-h1 text-h1 ${color}`}>{value}</h3>
          </div>
        ))}
      </div>

      {/* ── Fit distribution par poste ─────────────────────── */}
      {distribution.length > 0 && (
        <section className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm space-y-lg">
          <h3 className="font-h3 text-h3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">donut_large</span>
            Distribution par poste
          </h3>
          <div className="space-y-md">
            {distribution.map((d) => (
              <div key={d.jobId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-body-sm font-semibold text-on-surface">{d.jobTitle}</span>
                  <span className="text-label-caps text-slate-400">{d.total} candidat{d.total > 1 ? "s" : ""}</span>
                </div>
                <div className="flex rounded-full overflow-hidden h-3">
                  {d.strong > 0 && (
                    <div
                      className="bg-emerald-500 transition-all"
                      style={{ width: `${(d.strong / d.total) * 100}%` }}
                      title={`Strong: ${d.strong}`}
                    />
                  )}
                  {d.medium > 0 && (
                    <div
                      className="bg-amber-400 transition-all"
                      style={{ width: `${(d.medium / d.total) * 100}%` }}
                      title={`Medium: ${d.medium}`}
                    />
                  )}
                  {d.weak > 0 && (
                    <div
                      className="bg-slate-200 transition-all"
                      style={{ width: `${(d.weak / d.total) * 100}%` }}
                      title={`Weak: ${d.weak}`}
                    />
                  )}
                </div>
                <div className="flex gap-4 mt-1">
                  <span className="text-label-caps text-emerald-600">{d.strong} fort{d.strong > 1 ? "s" : ""}</span>
                  <span className="text-label-caps text-amber-600">{d.medium} moyen{d.medium > 1 ? "s" : ""}</span>
                  <span className="text-label-caps text-slate-400">{d.weak} faible{d.weak > 1 ? "s" : ""}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Heatmap compétences manquantes ─────────────────── */}
      {gaps.length > 0 && (
        <section className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm space-y-lg">
          <h3 className="font-h3 text-h3 flex items-center gap-2">
            <span className="material-symbols-outlined text-error">whatshot</span>
            Compétences les plus souvent manquantes
          </h3>
          <p className="text-body-sm text-slate-500">
            Gaps les plus fréquents parmi tous les candidats — utile pour identifier les profils rares ou les exigences trop strictes.
          </p>
          <div className="space-y-sm">
            {gaps.map((g) => (
              <div key={g.skill} className="flex items-center gap-3">
                <span className="text-body-sm text-on-surface w-24 sm:w-40 truncate shrink-0">{g.skill}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-400 rounded-full transition-all"
                    style={{ width: `${g.pct}%` }}
                  />
                </div>
                <span className="text-label-caps text-slate-400 w-16 sm:w-20 text-right shrink-0">
                  {g.count} × ({g.pct}%)
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {total === 0 && (
        <div className="text-center py-xl text-slate-400">
          <span className="material-symbols-outlined text-4xl block mb-2">bar_chart</span>
          <p>Importez des candidats pour voir les statistiques.</p>
        </div>
      )}
    </div>
  );
}
