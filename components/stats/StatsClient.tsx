"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { candidateUrl } from "@/lib/slugify";
import { scoreToFit } from "@/lib/thresholds";

export type PlainApp = {
  id: number;
  candidateSalt: string;
  candidateName: string;
  jobId: number;
  jobSalt: string;
  jobTitle: string;
  jobStages: string[];
  stageIndex: number;
  score: number;
  source: string;
  gaps: string[];
  appliedAt: string;
  movedAt: string | null;
};

export type PlainJob = { id: number; title: string };
export type Thresholds = { strong: number; medium: number };

const PERIODS = {
  "4w": { label: "4 sem",  weeks: 4,  blockedDays: 5,  monthly: false },
  "8w": { label: "8 sem",  weeks: 8,  blockedDays: 7,  monthly: false },
  "6m": { label: "6 mois", weeks: 26, blockedDays: 14, monthly: true  },
  all:  { label: "Tout",   weeks: 0,  blockedDays: 14, monthly: false },
} as const;
type PeriodKey = keyof typeof PERIODS;

const SOURCE_COLORS = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-amber-500","bg-rose-500","bg-slate-400"];

export default function StatsClient({
  allApps,
  jobs,
  thresholds,
}: {
  allApps: PlainApp[];
  jobs: PlainJob[];
  thresholds: Thresholds;
}) {
  const [period, setPeriod] = useState<PeriodKey>("all");
  const { weeks, blockedDays, monthly } = PERIODS[period];
  const now = Date.now();
  const msPerWeek = 7 * 86_400_000;

  // Filter apps by period
  const apps = useMemo(() => {
    if (period === "all") return allApps;
    const cutoff = now - weeks * msPerWeek;
    return allApps.filter((a) => new Date(a.appliedAt).getTime() >= cutoff);
  }, [allApps, period, now, weeks, msPerWeek]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const total       = apps.length;
  const strongCount = apps.filter((a) => scoreToFit(a.score, thresholds) === "strong").length;
  const mediumCount = apps.filter((a) => scoreToFit(a.score, thresholds) === "medium").length;
  const weakCount   = apps.filter((a) => scoreToFit(a.score, thresholds) === "weak").length;
  const avgScore    = total > 0 ? Math.round(apps.reduce((s, a) => s + a.score, 0) / total) : 0;

  // ── Tendance ──────────────────────────────────────────────────────────────
  const trendBuckets = useMemo(() => {
    const buckets: { label: string; count: number }[] = [];
    const n = period === "all" ? 8 : weeks;
    const useMonthly = period === "all" ? false : monthly;

    if (useMonthly) {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now); d.setMonth(d.getMonth() - i, 1); d.setHours(0,0,0,0);
        const start = d.getTime();
        const end   = i === 0 ? now : (() => { const e = new Date(d); e.setMonth(e.getMonth()+1); return e.getTime(); })();
        const count = allApps.filter((a) => { const t = new Date(a.appliedAt).getTime(); return t>=start && t<end; }).length;
        buckets.push({ label: d.toLocaleDateString("fr-FR", { month: "short" }), count });
      }
    } else {
      for (let i = n - 1; i >= 0; i--) {
        const start = now - (i+1)*msPerWeek, end = now - i*msPerWeek;
        const count = allApps.filter((a) => { const t = new Date(a.appliedAt).getTime(); return t>=start && t<end; }).length;
        const d = new Date(end);
        buckets.push({ label: `${d.getDate()}/${d.getMonth()+1}`, count });
      }
    }
    return buckets;
  }, [allApps, period, now, weeks, monthly, msPerWeek]);
  const maxTrend = Math.max(...trendBuckets.map((b) => b.count), 1);

  // ── Distribution ──────────────────────────────────────────────────────────
  const distribution = useMemo(() => jobs.map((job) => {
    const ja = apps.filter((a) => a.jobId === job.id);
    return {
      jobId:   job.id,
      jobTitle: job.title,
      strong: ja.filter((a) => scoreToFit(a.score, thresholds) === "strong").length,
      medium: ja.filter((a) => scoreToFit(a.score, thresholds) === "medium").length,
      weak:   ja.filter((a) => scoreToFit(a.score, thresholds) === "weak").length,
      total:  ja.length,
    };
  }).filter((d) => d.total > 0), [apps, jobs, thresholds]);

  // ── Sources ───────────────────────────────────────────────────────────────
  const sources = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of apps) map[a.source || "Autre"] = (map[a.source || "Autre"] ?? 0) + 1;
    return Object.entries(map).sort((a,b)=>b[1]-a[1])
      .map(([source, count]) => ({ source, count, pct: Math.round((count/(total||1))*100) }));
  }, [apps, total]);

  // ── Gaps ──────────────────────────────────────────────────────────────────
  const gaps = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const a of apps) for (const g of a.gaps) freq[g] = (freq[g]??0)+1;
    const t = apps.length || 1;
    return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,20)
      .map(([skill, count]) => ({ skill, count, pct: Math.round((count/t)*100) }));
  }, [apps]);

  // ── Stage duration ────────────────────────────────────────────────────────
  const stageStats = useMemo(() => {
    const dur: Record<string, {total:number;count:number}> = {};
    for (const a of apps.filter((a)=>a.movedAt)) {
      const stage = a.jobStages[a.stageIndex] ?? `Étape ${a.stageIndex}`;
      const days  = Math.round((now - new Date(a.movedAt!).getTime()) / 86_400_000);
      if (!dur[stage]) dur[stage] = {total:0,count:0};
      dur[stage].total += days; dur[stage].count += 1;
    }
    return Object.entries(dur)
      .map(([stage,{total,count}]) => ({stage, avgDays: Math.round(total/count), count}))
      .sort((a,b)=>b.avgDays-a.avgDays);
  }, [apps, now]);

  // ── Blocked ───────────────────────────────────────────────────────────────
  const blocked = useMemo(() =>
    apps.filter((a) => {
      const ref = a.movedAt ?? a.appliedAt;
      return Math.round((now - new Date(ref).getTime()) / 86_400_000) > blockedDays;
    })
    .sort((a,b) => new Date(a.movedAt??a.appliedAt).getTime() - new Date(b.movedAt??b.appliedAt).getTime())
    .slice(0, 10),
  [apps, blockedDays, now]);

  // ── Funnel ────────────────────────────────────────────────────────────────
  const [funnelJobId, setFunnelJobId] = useState<number | null>(jobs[0]?.id ?? null);

  const funnel = useMemo(() => {
    if (funnelJobId === null) return [];
    const jobApps = allApps.filter((a) => a.jobId === funnelJobId);
    if (jobApps.length === 0) return [];
    const stages = jobApps[0].jobStages;
    if (stages.length === 0) return [];

    return stages
      .map((stage, idx) => {
        const atOrAbove = jobApps.filter((a) => a.stageIndex >= idx).length;
        const next      = idx < stages.length - 1
          ? jobApps.filter((a) => a.stageIndex >= idx + 1).length
          : null;
        return { stage, count: atOrAbove, passRate: next !== null && atOrAbove > 0 ? Math.round((next / atOrAbove) * 100) : null };
      })
      .filter((e) => e.count > 0);
  }, [allApps, funnelJobId]);

  return (
    <div className="space-y-xl">

      {/* ── Période ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-label-caps text-secondary uppercase">Période</span>
        {(Object.entries(PERIODS) as [PeriodKey, typeof PERIODS[PeriodKey]][]).map(([key, {label}]) => (
          <button key={key} type="button" onClick={() => setPeriod(key)}
            className={["px-4 py-1.5 rounded-full text-label-caps font-label-caps border transition-colors",
              period === key ? "bg-primary text-white border-primary" : "bg-white border-slate-200 text-slate-500 hover:border-primary/40 hover:text-primary"
            ].join(" ")}
          >{label}</button>
        ))}
      </div>

      {/* ── KPIs ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        {[
          { dot: "bg-blue-500",    label: "Candidatures", value: total          },
          { dot: "bg-emerald-500", label: "Strong Fit",   value: strongCount    },
          { dot: "bg-amber-400",   label: "À évaluer",    value: mediumCount    },
          { dot: "bg-slate-400",   label: "Score moyen",  value: `${avgScore}%` },
        ].map(({dot, label, value}) => (
          <div key={label} className="tonal-card rounded-xl p-lg flex flex-col gap-sm">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
              <p className="font-label-caps text-label-caps text-secondary uppercase">{label}</p>
            </div>
            <p className="font-h2 text-h2 text-on-surface">{value}</p>
          </div>
        ))}
      </div>

      {total === 0 && (
        <div className="text-center py-xl text-slate-400">
          <span className="material-symbols-outlined text-4xl block mb-2">bar_chart</span>
          <p>{period === "all" ? "Importez des candidats pour voir les statistiques." : "Aucune candidature sur cette période."}</p>
        </div>
      )}

      {total > 0 && (<>

        {/* ── Tendance ─────────────────────────────────────── */}
        <section className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm space-y-lg">
          <h3 className="font-h3 text-h3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">trending_up</span>
            Candidatures {monthly && period !== "all" ? "par mois" : "par semaine"}
          </h3>
          <div className="flex items-end gap-2 h-28">
            {trendBuckets.map((b,i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400">{b.count > 0 ? b.count : ""}</span>
                <div className="w-full rounded-t-sm bg-primary/80 transition-all duration-300"
                  style={{ height: `${Math.max(4, (b.count/maxTrend)*80)}px` }} />
                <span className="text-[10px] text-slate-400 whitespace-nowrap">{b.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Distribution ─────────────────────────────────── */}
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
                    <span className="text-label-caps text-slate-400">{d.total} candidature{d.total>1?"s":""}</span>
                  </div>
                  <div className="flex rounded-full overflow-hidden h-3">
                    {d.strong>0 && <div className="bg-emerald-500" style={{width:`${(d.strong/d.total)*100}%`}} />}
                    {d.medium>0 && <div className="bg-amber-400"   style={{width:`${(d.medium/d.total)*100}%`}} />}
                    {d.weak>0   && <div className="bg-slate-200"   style={{width:`${(d.weak/d.total)*100}%`}} />}
                  </div>
                  <div className="flex gap-4 mt-1">
                    <span className="text-label-caps text-emerald-600">{d.strong} fort{d.strong>1?"s":""}</span>
                    <span className="text-label-caps text-amber-600">{d.medium} moyen{d.medium>1?"s":""}</span>
                    <span className="text-label-caps text-slate-400">{d.weak} faible{d.weak>1?"s":""}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Sources ──────────────────────────────────────── */}
        {sources.length > 0 && (
          <section className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm space-y-lg">
            <h3 className="font-h3 text-h3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">link</span>
              Sources de candidatures
            </h3>
            <div className="space-y-sm">
              {sources.map(({source,count,pct},i) => (
                <div key={source} className="flex items-center gap-3">
                  <span className="text-body-sm font-medium w-32 sm:w-44 truncate shrink-0">{source}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${SOURCE_COLORS[i%SOURCE_COLORS.length]}`} style={{width:`${pct}%`}} />
                  </div>
                  <span className="text-label-caps text-slate-500 w-20 text-right shrink-0">{count} ({pct}%)</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Temps par étape ──────────────────────────────── */}
        {stageStats.length > 0 && (
          <section className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm space-y-lg">
            <h3 className="font-h3 text-h3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">timer</span>
              Temps moyen par étape
            </h3>
            <div className="space-y-sm">
              {stageStats.map(({stage,avgDays,count}) => (
                <div key={stage} className="flex items-center justify-between">
                  <span className="text-body-sm font-medium w-40 truncate shrink-0">{stage}</span>
                  <div className="flex-1 mx-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${avgDays>14?"bg-red-400":avgDays>7?"bg-amber-400":"bg-emerald-400"}`}
                      style={{width:`${Math.min(100,(avgDays/30)*100)}%`}} />
                  </div>
                  <span className="text-label-caps text-slate-500 w-28 text-right shrink-0">
                    {avgDays}j moy. · {count} candidat{count>1?"s":""}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Candidats bloqués ────────────────────────────── */}
        {blocked.length > 0 && (
          <section className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm space-y-lg">
            <h3 className="font-h3 text-h3 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">warning</span>
              Sans mouvement depuis +{blockedDays} jours
            </h3>
            <div className="space-y-sm">
              {blocked.map((app) => {
                const ref  = app.movedAt ?? app.appliedAt;
                const days = Math.round((now - new Date(ref).getTime()) / 86_400_000);
                const stage = app.jobStages[app.stageIndex] ?? `Étape ${app.stageIndex}`;
                return (
                  <Link key={app.id} href={candidateUrl(app.candidateSalt, app.candidateName, app.jobSalt, app.jobTitle)}
                    className="flex items-center justify-between p-md bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                        {app.candidateName.split(" ").map((n)=>n[0]).join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="text-body-sm font-semibold text-on-surface truncate">{app.candidateName}</p>
                        <p className="text-label-caps text-slate-400 truncate">{app.jobTitle} · {stage}</p>
                      </div>
                    </div>
                    <span className={`text-label-caps font-bold shrink-0 ml-3 ${days>14?"text-red-500":"text-amber-600"}`}>
                      {days}j
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Funnel de conversion ─────────────────────────── */}
        {jobs.length > 0 && (
          <section className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm space-y-lg">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="font-h3 text-h3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">filter_alt</span>
                Funnel de conversion
              </h3>
              <select
                value={funnelJobId ?? ""}
                onChange={(e) => setFunnelJobId(Number(e.target.value) || null)}
                className="border border-outline-variant rounded-lg px-3 py-1.5 text-body-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>

            {funnel.length === 0 ? (
              <p className="text-body-sm text-slate-400">Aucune donnée pour ce poste.</p>
            ) : (
              <div className="space-y-sm">
                <p className="text-label-caps text-slate-400">
                  Approximation : nombre de candidats ayant atteint ou dépassé chaque étape.
                </p>
                {funnel.map(({ stage, count, passRate }, idx) => {
                  const maxCount = funnel[0]?.count || 1;
                  const widthPct = Math.round((count / maxCount) * 100);
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-body-sm w-36 sm:w-48 truncate shrink-0 font-medium">{stage}</span>
                      <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden relative">
                        <div
                          className="h-full bg-primary/20 border-r-2 border-primary/40 rounded-lg transition-all duration-300"
                          style={{ width: `${widthPct}%` }}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-label-caps font-bold text-primary">
                          {count}
                        </span>
                      </div>
                      <span className="text-label-caps shrink-0 w-16 text-right">
                        {passRate !== null
                          ? <span className={passRate < 30 ? "text-red-500 font-bold" : passRate < 60 ? "text-amber-600 font-bold" : "text-emerald-600 font-bold"}>{passRate}% →</span>
                          : <span className="text-slate-300">fin</span>
                        }
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── Gaps heatmap ─────────────────────────────────── */}
        {gaps.length > 0 && (
          <section className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm space-y-lg">
            <h3 className="font-h3 text-h3 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">whatshot</span>
              Compétences les plus souvent manquantes
            </h3>
            <div className="space-y-sm">
              {gaps.map((g) => (
                <div key={g.skill} className="flex items-center gap-3">
                  <span className="text-body-sm w-24 sm:w-40 truncate shrink-0">{g.skill}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{width:`${g.pct}%`}} />
                  </div>
                  <span className="text-label-caps text-slate-400 w-16 sm:w-20 text-right shrink-0">
                    {g.count} × ({g.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </>)}
    </div>
  );
}
