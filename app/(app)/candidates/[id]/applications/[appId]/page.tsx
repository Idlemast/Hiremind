import { getApplicationById, getThresholds } from "@/lib/db";
import { jobUrl, candidateUrl } from "@/lib/slugify";
import { notFound } from "next/navigation";
import Link from "next/link";
import CandidateNotes from "@/components/CandidateNotes";
import CandidateStageControl from "@/components/CandidateStageControl";
import { scoreToFit, fitToDecision, DECISION_META, getCommTemplates } from "@/lib/thresholds";
import { DEFAULT_STAGES, deriveProgress } from "@/lib/stages";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string; appId: string }>;
}) {
  const { id, appId } = await params;
  const [application, thresholds] = await Promise.all([
    getApplicationById(parseInt(appId, 10)),
    getThresholds(),
  ]);
  if (!application || application.candidate.id !== parseInt(id, 10)) notFound();

  const candidate = application.candidate;
  const job       = application.job;
  const skills    = (candidate.skills as string[] | null) ?? [];
  const gaps      = (application.gaps as string[] | null) ?? [];

  const matchScore   = application.score;
  const fit          = scoreToFit(matchScore, thresholds);
  const decision     = fitToDecision(fit);
  const decisionMeta = DECISION_META[decision];

  const rawJobStages = (job.stages as string[] | null | undefined);
  const jobStages    = rawJobStages?.length ? rawJobStages : DEFAULT_STAGES;
  const stageIdx     = application.stageIndex ?? 0;
  const currentStage = jobStages[stageIdx] ?? jobStages[0];
  const stageProgress = deriveProgress(stageIdx, jobStages.length);

  const jobBudget       = job.budget;
  const candidateSalary = candidate.salary;

  const templates = getCommTemplates(
    { firstName: candidate.name.split(" ")[0], jobTitle: job.title, gaps, matchedSkills: skills },
    decision
  );

  return (
    <div className="p-4 lg:p-xl max-w-7xl mx-auto space-y-lg animate-fade-in">

      {/* ── Header ─────────────────────────────────────────── */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
        <div className="flex items-center gap-md min-w-0">
          <Link
            href={candidateUrl(candidate.id, candidate.name)}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors shrink-0 text-slate-500 hover:text-primary"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-sm flex-wrap">
              <h2 className="font-h1 text-h1 text-on-surface">{candidate.name}</h2>
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-label-caps font-label-caps">
                {matchScore}% Match
              </span>
              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-label-caps font-label-caps border ${decisionMeta.badge}`}>
                <span className="material-symbols-outlined text-sm leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {decisionMeta.icon}
                </span>
                {decisionMeta.label}
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant mt-xs">
              {candidate.role} · {candidate.company} ·{" "}
              <Link href={jobUrl(job.id, job.title)} className="text-primary hover:underline font-semibold">
                {job.title}
              </Link>
            </p>
            {candidateSalary && (
              <div className="flex items-center gap-xs text-slate-500 mt-xs text-body-sm">
                <span className="material-symbols-outlined text-sm">payments</span>
                <span>{candidateSalary}</span>
                {jobBudget && <span className="text-slate-400">/ budget : {jobBudget}</span>}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Bento grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-lg">

        {/* The Why */}
        <div className="col-span-12 lg:col-span-8 bg-white p-lg rounded-xl border border-outline-variant shadow-sm relative overflow-hidden">
          <div className="status-ribbon bg-emerald-500" />
          <div className="flex items-center gap-sm mb-md">
            <span className="material-symbols-outlined text-emerald-600">auto_awesome</span>
            <h3 className="font-h3 text-h3">The Why</h3>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {application.why ?? "Aucune analyse disponible."}
          </p>
        </div>

        {/* Hiring Stage */}
        <div className="col-span-12 lg:col-span-4 bg-white p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between gap-md">
          <div>
            <h3 className="font-label-caps text-label-caps text-slate-400 mb-md uppercase tracking-wider">Étape</h3>
            <div className="flex mb-sm items-center justify-between">
              <span className="text-label-caps font-semibold py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-100 truncate max-w-[70%]">
                {currentStage}
              </span>
              <span className="text-label-caps font-semibold text-emerald-600">{stageProgress}%</span>
            </div>
            <div className="overflow-hidden h-1.5 mb-md rounded-full bg-emerald-100">
              <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${stageProgress}%` }} />
            </div>
            <CandidateStageControl
              applicationId={application.id}
              stageIndex={stageIdx}
              stages={jobStages}
              jobStageIndex={job.currentStageIndex ?? jobStages.length - 1}
            />
          </div>
          <div>
            <h3 className="font-label-caps text-label-caps text-slate-400 uppercase tracking-wider mb-1">Poste</h3>
            <Link href={jobUrl(job.id, job.title)} className="group">
              <p className="text-body-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{job.title}</p>
              <p className="text-body-sm text-slate-500">{job.department}</p>
            </Link>
            {candidateSalary && jobBudget && (
              <div className="mt-sm pt-sm border-t border-slate-100">
                <p className="text-label-caps text-slate-400 uppercase tracking-wider mb-1">Prétentions vs Budget</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-body-sm font-semibold">{candidateSalary}</span>
                  <span className="text-slate-300">→</span>
                  <span className="text-body-sm text-slate-500">{jobBudget}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Skills + Gaps */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm">
            <h3 className="font-h3 text-h3 mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">verified</span>
              Compétences matchées
            </h3>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-sm">
                {skills.map((skill) => (
                  <span key={skill} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-body-sm font-bold border border-blue-100">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-body-sm text-slate-400">Aucune compétence extraite.</p>
            )}
          </div>

          <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm relative overflow-hidden">
            <div className="status-ribbon bg-error" />
            <h3 className="font-h3 text-h3 mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-error">cancel</span>
              Gaps
            </h3>
            {gaps.length > 0 ? (
              <ul className="space-y-sm">
                {gaps.map((gap) => (
                  <li key={gap} className="flex items-center gap-sm text-on-surface-variant">
                    <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
                    <span className="text-body-sm">{gap}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-sm text-slate-400">Aucun gap identifié.</p>
            )}
          </div>

          <div className="col-span-1 md:col-span-2 bg-slate-900 text-white p-lg rounded-xl shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-lg opacity-10">
              <span className="material-symbols-outlined text-[120px]">psychology_alt</span>
            </div>
            <div className="relative z-10">
              <h3 className="font-h3 text-h3 mb-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-surface-tint">balance</span>
                Trustable Negative Logic
              </h3>
              <div className="bg-white/5 p-md rounded-lg border border-white/10">
                <p className="text-label-caps text-slate-400 mb-1 uppercase">Decision Context</p>
                <p className="text-body-md leading-relaxed">
                  {gaps.length > 0
                    ? `Despite ${gaps.length} identified gap${gaps.length > 1 ? "s" : ""}, this candidate's core strengths directly address the role's primary requirements.`
                    : "No significant gaps. Strong candidate for immediate advancement."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Comm Assistant + Notes */}
        <aside className="col-span-12 lg:col-span-4 space-y-lg">
          <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm">
            <h3 className="font-h3 text-h3 mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">forum</span>
              Comm Assistant
            </h3>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-lg ${decisionMeta.badge}`}>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{decisionMeta.icon}</span>
              <span className="font-label-caps text-label-caps">
                Recommandation : <strong>{decisionMeta.label}</strong>
              </span>
            </div>
            <div className="space-y-lg">
              {templates.advance && (
                <div className="space-y-sm">
                  <p className="font-label-caps text-label-caps text-slate-500 uppercase">
                    {decision === "review" ? "Option A · Avancer" : "Draft · Étape suivante"}
                  </p>
                  <pre className="bg-emerald-50 border border-emerald-100 p-md rounded-lg text-body-sm text-on-surface-variant whitespace-pre-wrap font-sans leading-relaxed overflow-x-auto">
                    {templates.advance}
                  </pre>
                </div>
              )}
              {templates.reject && (
                <div className="space-y-sm">
                  <p className="font-label-caps text-label-caps text-slate-500 uppercase">
                    {decision === "review" ? "Option B · Décliner" : "Draft · Refus"}
                  </p>
                  <pre className={`p-md rounded-lg border text-body-sm text-on-surface-variant whitespace-pre-wrap font-sans leading-relaxed overflow-x-auto ${
                    decision === "reject" ? "bg-red-50 border-red-100" : "bg-surface-container border-outline-variant"
                  }`}>
                    {templates.reject}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm">
            <h3 className="font-h3 text-h3 mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">edit_note</span>
              Notes recruteur
            </h3>
            <CandidateNotes
              applicationId={application.id}
              initialNotes={application.notes ?? ""}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
