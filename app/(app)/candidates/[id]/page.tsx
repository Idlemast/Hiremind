import { getCandidateBySalt, getApplications, getJobs } from "@/lib/db";
import { candidateUrl } from "@/lib/slugify";
import { notFound, redirect } from "next/navigation";
import LinkCandidateToJobButton from "@/components/candidates/LinkCandidateToJobButton";
import type { JobOption } from "@/components/candidates/LinkCandidateToJobButton";

export default async function CandidateBasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }  = await params;
  const salt    = id.split("-")[0];

  const candidate = await getCandidateBySalt(salt);
  if (!candidate) notFound();

  const applications = await getApplications(undefined, candidate.id);

  if (applications.length > 0) {
    const first = applications[0];
    redirect(candidateUrl(candidate.salt!, candidate.name, first.job.salt!, first.job.title));
  }

  const allJobs = await getJobs();
  const availableJobs: JobOption[] = allJobs
    .filter((j) => j.status !== "closed")
    .map((j) => ({ id: j.id, title: j.title, department: j.department }));

  return (
    <div className="p-4 lg:p-xl max-w-3xl mx-auto space-y-lg">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-white text-2xl font-bold font-h1">
          {candidate.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <h2 className="font-h1 text-h1 text-on-surface">{candidate.name}</h2>
          <p className="text-body-sm text-slate-500">{candidate.role} · {candidate.company}</p>
        </div>
      </div>
      <div className="bg-white border border-dashed border-slate-200 rounded-xl p-xl text-center text-slate-400 space-y-3">
        <span className="material-symbols-outlined text-4xl block">work_off</span>
        <p>Ce candidat n'est lié à aucun poste.</p>
        <LinkCandidateToJobButton candidateId={candidate.id} availableJobs={availableJobs} />
      </div>
    </div>
  );
}
