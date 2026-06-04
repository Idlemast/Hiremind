import { getApplicationById, getThresholds } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { jobUrl } from "@/lib/slugify";
import { scoreToFit } from "@/lib/thresholds";
import { DEFAULT_STAGES } from "@/lib/stages";
import CompareColumn from "@/components/CompareColumn";
import type { CompareApp } from "@/components/CompareColumn";

export default async function ComparePage({
  params,
  searchParams,
}: {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { id }    = await params;
  const { a, b }  = await searchParams;
  const jobId     = parseInt(id, 10);
  const aId       = parseInt(a ?? "", 10);
  const bId       = parseInt(b ?? "", 10);

  if (!Number.isFinite(aId) || !Number.isFinite(bId) || aId === bId) notFound();

  const [thresholds, appA, appB] = await Promise.all([
    getThresholds(),
    getApplicationById(aId),
    getApplicationById(bId),
  ]);

  if (!appA || !appB) notFound();
  if (appA.job.id !== jobId || appB.job.id !== jobId) notFound();

  // Skill diff computation
  const skillsA = (appA.candidate.skills as string[] | null) ?? [];
  const skillsB = (appB.candidate.skills as string[] | null) ?? [];
  const setA    = new Set(skillsA.map((s) => s.toLowerCase()));
  const setB    = new Set(skillsB.map((s) => s.toLowerCase()));

  const sharedA = skillsA.filter((s) => setB.has(s.toLowerCase()));
  const sharedB = skillsB.filter((s) => setA.has(s.toLowerCase()));
  const onlyA   = skillsA.filter((s) => !setB.has(s.toLowerCase()));
  const onlyB   = skillsB.filter((s) => !setA.has(s.toLowerCase()));

  const toCompareApp = (app: typeof appA, shared: string[], only: string[]): CompareApp => {
    const stages = (app.job.stages as string[] | null)?.length ? app.job.stages as string[] : DEFAULT_STAGES;
    return {
      id:            app.id,
      candidateId:   app.candidate.id,
      candidateName: app.candidate.name,
      candidateRole: app.candidate.role,
      score:         app.score,
      fit:           scoreToFit(app.score, thresholds),
      why:           app.why ?? null,
      skills:        (app.candidate.skills as string[] | null) ?? [],
      gaps:          (app.gaps          as string[] | null) ?? [],
      stageIndex:    app.stageIndex,
      stages,
      notes:         app.notes ?? null,
      salary:        app.candidate.salary ?? null,
      jobBudget:     app.job.budget ?? null,
      jobTitle:      app.job.title,
    };
  };

  const colA = toCompareApp(appA, sharedA, onlyA);
  const colB = toCompareApp(appB, sharedB, onlyB);

  return (
    <div className="p-4 lg:p-xl max-w-7xl mx-auto space-y-xl">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-h2 text-h2 text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">compare_arrows</span>
            Comparaison
          </h2>
          <p className="text-body-sm text-slate-500 mt-0.5">{appA.job.title}</p>
        </div>
        <Link
          href={jobUrl(jobId, appA.job.title)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant text-on-surface-variant rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Retour au poste
        </Link>
      </div>

      {/* ── Score comparison bar ──────────────────────────────── */}
      <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
        <div className="grid grid-cols-2 gap-lg">
          <div className="text-center">
            <p className="font-semibold text-on-surface truncate">{appA.candidate.name}</p>
            <div className="flex items-center gap-2 justify-center mt-sm">
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${appA.score}%` }} />
              </div>
              <span className="font-bold text-primary text-body-md w-10 text-right">{appA.score}%</span>
            </div>
          </div>
          <div className="text-center">
            <p className="font-semibold text-on-surface truncate">{appB.candidate.name}</p>
            <div className="flex items-center gap-2 justify-center mt-sm">
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${appB.score}%` }} />
              </div>
              <span className="font-bold text-primary text-body-md w-10 text-right">{appB.score}%</span>
            </div>
          </div>
        </div>
        {Math.abs(appA.score - appB.score) >= 5 && (
          <p className="text-center text-label-caps text-slate-400 mt-md">
            {appA.score > appB.score
              ? `${appA.candidate.name.split(" ")[0]} devance de ${appA.score - appB.score} pts`
              : `${appB.candidate.name.split(" ")[0]} devance de ${appB.score - appA.score} pts`}
          </p>
        )}
      </div>

      {/* ── Two columns ──────────────────────────────────────── */}
      <div className="flex gap-xl flex-col lg:flex-row">
        <CompareColumn app={colA} sharedSkills={sharedA} onlySkills={onlyA} />
        <div className="hidden lg:block w-px bg-slate-200 shrink-0" />
        <CompareColumn app={colB} sharedSkills={sharedB} onlySkills={onlyB} />
      </div>
    </div>
  );
}
