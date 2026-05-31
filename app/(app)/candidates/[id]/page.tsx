import { getCandidateById } from "@/lib/db";
import { notFound } from "next/navigation";
import TagEditor from "@/components/TagEditor";

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = await getCandidateById(Number(id));
  if (!candidate) notFound();

  const skills = candidate.skills as string[];
  const gaps   = candidate.gaps   as string[];
  const tags   = candidate.tags   as string[];

  const initials = candidate.name.split(" ").map((n) => n[0]).join("");
  const matchScore = candidate.score;
  const stageProgress = 33;

  return (
    <div className="p-xl max-w-7xl mx-auto space-y-lg">

      {/* ── Profile header ─────────────────────────────────────── */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div className="flex items-center gap-lg">
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-xl bg-primary flex items-center justify-center text-white text-3xl font-bold font-h1 border-4 border-white shadow-md">
              {initials}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-sm">
              <h2 className="font-h1 text-h1 text-on-surface">{candidate.name}</h2>
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-label-caps font-label-caps">
                {matchScore}% Match
              </span>
            </div>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              {candidate.role} • {candidate.location}
            </p>
            <div className="flex gap-md mt-sm">
              <div className="flex items-center gap-xs text-slate-500">
                <span className="material-symbols-outlined text-sm">work</span>
                <span className="text-body-sm">{candidate.company}</span>
              </div>
              {candidate.salary && (
                <div className="flex items-center gap-xs text-slate-500">
                  <span className="material-symbols-outlined text-sm">currency_exchange</span>
                  <span className="text-body-sm">{candidate.salary}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-sm shrink-0">
          <button className="px-6 py-2 bg-white border border-outline-variant text-on-surface-variant font-bold rounded-lg hover:bg-slate-50 transition-colors">
            Archive
          </button>
          <button className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-container transition-colors shadow-md">
            Schedule Interview
          </button>
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
        <div className="col-span-12 lg:col-span-4 bg-white p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-label-caps text-label-caps text-slate-400 mb-md uppercase tracking-wider">Hiring Stage</h3>
            <div className="flex mb-2 items-center justify-between">
              <span className="text-xs font-semibold py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-100">
                Profile Screening
              </span>
              <span className="text-xs font-semibold text-emerald-600">{stageProgress}%</span>
            </div>
            <div className="overflow-hidden h-2 mb-4 rounded bg-emerald-100">
              <div className="h-full bg-emerald-500" style={{ width: `${stageProgress}%` }} />
            </div>
          </div>
          <div>
            <h3 className="font-label-caps text-label-caps text-slate-400 uppercase tracking-wider mb-2">Job</h3>
            <p className="text-body-sm font-semibold text-on-surface">{candidate.job.title}</p>
            <p className="text-body-sm text-slate-500">{candidate.job.department}</p>
          </div>
        </div>

        {/* Skills + Gaps + Trustable Negative */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-lg">

          <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm">
            <h3 className="font-h3 text-h3 mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">verified</span>
              Top Match Skills
            </h3>
            <div className="flex flex-wrap gap-sm">
              {skills.map((skill) => (
                <span key={skill} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-body-sm font-bold border border-blue-100">
                  {skill}
                </span>
              ))}
            </div>
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
              <p className="text-body-sm text-slate-400">No gaps identified.</p>
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

        {/* Comm Assistant + Tags */}
        <aside className="col-span-12 lg:col-span-4 space-y-lg">
          <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm">
            <h3 className="font-h3 text-h3 mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">forum</span>
              Comm Assistant
            </h3>
            <div className="space-y-lg">
              <div className="space-y-sm">
                <div className="flex justify-between items-center">
                  <p className="font-label-caps text-label-caps text-slate-500 uppercase">Draft: Next Step</p>
                  <button className="text-xs text-primary font-bold hover:underline">Copy</button>
                </div>
                <div className="bg-surface-container p-md rounded-lg border border-outline-variant text-body-sm text-on-surface-variant italic">
                  "Hi {candidate.name.split(" ")[0]}, the team was impressed with your background. We'd love to invite you to a technical walkthrough…"
                </div>
              </div>
              <div className="space-y-sm">
                <div className="flex justify-between items-center">
                  <p className="font-label-caps text-label-caps text-slate-500 uppercase">Draft: Soft Pass</p>
                  <button className="text-xs text-primary font-bold hover:underline">Copy</button>
                </div>
                <div className="bg-surface-container p-md rounded-lg border border-outline-variant text-body-sm text-on-surface-variant italic">
                  "Hi {candidate.name.split(" ")[0]}, thank you for your application. While your profile is strong, we are currently prioritizing candidates with a slightly different background…"
                </div>
              </div>
            </div>
            <button className="w-full mt-lg py-3 border-2 border-primary text-primary font-bold rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">edit_note</span>
              Customize Templates
            </button>
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
