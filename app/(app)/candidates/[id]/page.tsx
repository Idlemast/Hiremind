import { getCandidateById, getThresholds } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import TagEditor from "@/components/TagEditor";
import CandidateNotes from "@/components/CandidateNotes";
import CandidateStageControl from "@/components/CandidateStageControl";
import DeleteCandidateButton from "@/components/DeleteCandidateButton";
import { scoreToFit, fitToDecision, DECISION_META, getCommTemplates } from "@/lib/thresholds";
import { DEFAULT_STAGES, deriveProgress } from "@/lib/stages";

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [candidate, thresholds] = await Promise.all([
    getCandidateById(Number(id)),
    getThresholds(),
  ]);
  if (!candidate) notFound();

  const skills = candidate.skills as string[];
  const gaps   = candidate.gaps   as string[];
  const tags   = candidate.tags   as string[];

  const initials   = candidate.name.split(" ").map((n) => n[0]).join("");
  const matchScore = candidate.score;
  const fit        = scoreToFit(matchScore, thresholds);
  const decision   = fitToDecision(fit);
  const decisionMeta = DECISION_META[decision];

  // Stage tracking — per-candidate
  const rawJobStages  = candidate.job.stages as string[] | null | undefined;
  const jobStages     = rawJobStages?.length ? rawJobStages : DEFAULT_STAGES;
  const stageIdx      = candidate.stageIndex ?? 0;
  const currentStage  = jobStages[stageIdx] ?? jobStages[0];
  const stageProgress = deriveProgress(stageIdx, jobStages.length);

  // Salary vs budget
  const jobBudget      = (candidate.job as any).budget as string | null | undefined;
  const candidateSalary = candidate.salary;

  const templates = getCommTemplates(
    {
      firstName:    candidate.name.split(" ")[0],
      jobTitle:     candidate.job.title,
      gaps,
      matchedSkills: skills,
    },
    decision
  );

  return (
    <div className="p-4 lg:p-xl max-w-7xl mx-auto space-y-lg animate-fade-in">

      {/* ── Profile header ─────────────────────────────────────── */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div className="flex items-center gap-lg">
          <div className="relative shrink-0">
            <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-xl bg-primary flex items-center justify-center text-white text-2xl lg:text-3xl font-bold font-h1 border-4 border-white shadow-md">
              {initials}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
          </div>
          <div>
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
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              {candidate.role} • {candidate.location}
            </p>
            <div className="flex gap-md mt-sm flex-wrap">
              <div className="flex items-center gap-xs text-slate-500">
                <span className="material-symbols-outlined text-sm">work</span>
                <span className="text-body-sm">{candidate.company}</span>
              </div>
              {candidateSalary && (
                <div className="flex items-center gap-xs text-slate-500">
                  <span className="material-symbols-outlined text-sm">payments</span>
                  <span className="text-body-sm">{candidateSalary}</span>
                  {jobBudget && (
                    <span className="text-label-caps text-slate-400">
                      / budget : {jobBudget}
                    </span>
                  )}
                </div>
              )}
              {!candidateSalary && jobBudget && (
                <div className="flex items-center gap-xs text-slate-400">
                  <span className="material-symbols-outlined text-sm">payments</span>
                  <span className="text-body-sm">Budget : {jobBudget}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-sm shrink-0 flex-wrap">
          <Link
            href={`/candidates/${candidate.id}/edit`}
            className="p-2 sm:px-4 sm:py-2 bg-white border border-outline-variant text-on-surface-variant font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-sm"
            title="Modifier"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            <span className="hidden sm:inline">Modifier</span>
          </Link>
          <DeleteCandidateButton candidateId={candidate.id} candidateName={candidate.name} />
        </div>
      </section>

      {/* ── Bento grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-lg">

        {/* The Why */}
        <div className="col-span-12 lg:col-span-8 bg-white p-lg rounded-xl border border-outline-variant shadow-sm relative overflow-hidden">
          <div className="status-ribbon bg-emerald-500" />
          <div className="flex items-center gap-sm mb-md">
            <span className="material-symbols-outlined text-emerald-600">auto_awesome</span>
            <h3 className="font-h3 text-h3">The Why</h3>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {candidate.why ?? "No analysis available yet."}
          </p>
        </div>

        {/* Hiring Stage */}
        <div className="col-span-12 lg:col-span-4 bg-white p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between gap-md">
          <div>
            <h3 className="font-label-caps text-label-caps text-slate-400 mb-md uppercase tracking-wider">Hiring Stage</h3>
            <div className="flex mb-sm items-center justify-between">
              <span className="text-label-caps font-semibold py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-100">
                {currentStage}
              </span>
              <span className="text-label-caps font-semibold text-emerald-600">{stageProgress}%</span>
            </div>
            <div className="overflow-hidden h-1.5 mb-md rounded-full bg-emerald-100">
              <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${stageProgress}%` }} />
            </div>
            <CandidateStageControl
              candidateId={candidate.id}
              stageIndex={stageIdx}
              stages={jobStages}
            />
          </div>
          <div>
            <h3 className="font-label-caps text-label-caps text-slate-400 uppercase tracking-wider mb-2">Poste</h3>
            <Link href={`/jobs/${candidate.job.id}`} className="group">
              <p className="text-body-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{candidate.job.title}</p>
              <p className="text-body-sm text-slate-500">{candidate.job.department}</p>
            </Link>
            {candidateSalary && jobBudget && (
              <div className="mt-sm pt-sm border-t border-slate-100">
                <p className="text-label-caps text-slate-400 uppercase tracking-wider mb-1">Prétentions vs Budget</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-body-sm font-semibold text-on-surface">{candidateSalary}</span>
                  <span className="text-slate-300">→</span>
                  <span className="text-body-sm text-slate-500">{jobBudget}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Skills + Gaps + Trustable Negative */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-lg">

          <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm">
            <h3 className="font-h3 text-h3 mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">verified</span>
              Top Match Skills
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

          <div className="col-span-1 md:col-span-2 bg-slate-900 text-white p-lg rounded-xl border border-slate-800 shadow-xl overflow-hidden relative">
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
                    ? `Despite ${gaps.length} identified gap${gaps.length > 1 ? "s" : ""}, this candidate's core strengths directly address the role's primary requirements. Recommend proceeding to technical evaluation.`
                    : "No significant gaps. Strong candidate for immediate advancement."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Comm Assistant + Tags + Notes */}
        <aside className="col-span-12 lg:col-span-4 space-y-lg">
          <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm">
            <h3 className="font-h3 text-h3 mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">forum</span>
              Comm Assistant
            </h3>

            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-lg ${decisionMeta.badge}`}>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                {decisionMeta.icon}
              </span>
              <span className="font-label-caps text-label-caps">
                Recommandation : <strong>{decisionMeta.label}</strong>
              </span>
            </div>

            <div className="space-y-lg">
              {templates.advance && (
                <div className="space-y-sm">
                  <div className="flex justify-between items-center">
                    <p className="font-label-caps text-label-caps text-slate-500 uppercase">
                      {decision === "review" ? "Option A · Avancer" : "Draft · Étape suivante"}
                    </p>
                    <button className="text-xs text-primary font-bold hover:underline">Copier</button>
                  </div>
                  <pre className="bg-emerald-50 border border-emerald-100 p-md rounded-lg text-body-sm text-on-surface-variant whitespace-pre-wrap font-sans leading-relaxed overflow-x-auto">
                    {templates.advance}
                  </pre>
                </div>
              )}
              {templates.reject && (
                <div className="space-y-sm">
                  <div className="flex justify-between items-center">
                    <p className="font-label-caps text-label-caps text-slate-500 uppercase">
                      {decision === "review" ? "Option B · Décliner" : "Draft · Refus"}
                    </p>
                    <button className="text-xs text-primary font-bold hover:underline">Copier</button>
                  </div>
                  <pre className={`p-md rounded-lg border text-body-sm text-on-surface-variant whitespace-pre-wrap font-sans leading-relaxed overflow-x-auto ${
                    decision === "reject" ? "bg-red-50 border-red-100" : "bg-surface-container border-outline-variant"
                  }`}>
                    {templates.reject}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm">
            <h3 className="font-h3 text-h3 mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">edit_note</span>
              Notes recruteur
            </h3>
            <CandidateNotes
              candidateId={candidate.id}
              initialNotes={candidate.notes ?? ""}
            />
          </div>

          <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm space-y-md">
            <h3 className="font-label-caps text-label-caps text-slate-400 uppercase tracking-wider">Internal Tags</h3>
            <TagEditor candidateId={candidate.id} initialTags={tags} />
            <div className="pt-md border-t border-slate-100">
              <p className="text-label-caps text-slate-400 mb-2 uppercase">Source</p>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>link</span>
                <span className="text-body-sm font-bold">{candidate.source}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
