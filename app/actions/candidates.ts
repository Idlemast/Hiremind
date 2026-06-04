"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getEm, getCandidateById } from "@/lib/db";
import { scoreCandidate, buildWhy } from "@/lib/triage";
import { scoreToFit } from "@/lib/thresholds";
import { analyzeInterviewNotes, notesScoreDelta } from "@/lib/interview-signals";
import { extractSkillsFromText, parseManualSkills, mergeSkills } from "@/lib/extract-skills";
import { Candidate, Application, Job } from "@/entities/index";

export async function importCandidate(formData: FormData) {
  const jobId    = Number(formData.get("jobId"));
  const name     = String(formData.get("name")     ?? "").trim();
  const role     = String(formData.get("role")     ?? "").trim();
  const company  = String(formData.get("company")  ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const email    = String(formData.get("email")    ?? "").trim() || undefined;
  const salary   = String(formData.get("salary")   ?? "").trim() || undefined;
  const source   = String(formData.get("source")   ?? "Manual").trim();
  const cvText   = String(formData.get("cvText")   ?? "");
  const rawSkills = String(formData.get("skills")  ?? "");

  if (!Number.isFinite(jobId) || jobId <= 0) {
    throw new Error("jobId invalide");
  }
  if (!name || !role || !company || !location) {
    throw new Error("Champs obligatoires manquants");
  }

  const em  = await getEm();
  const job = await em.findOne(Job, { id: jobId });
  if (!job) throw new Error("Job introuvable");

  const manualSkills    = parseManualSkills(rawSkills);
  const extractedSkills = extractSkillsFromText(cvText);
  const skills          = mergeSkills(manualSkills, extractedSkills);

  const requirements = (job.requirements as string[] | null) ?? [];
  const result       = scoreCandidate({ candidateSkills: skills, jobRequirements: requirements });

  const candidate = em.create(Candidate, {
    name, role, company, location, email, salary, source,
    skills, tags: [],
  });
  em.persist(candidate);

  const application = em.create(Application, {
    candidate,
    job,
    score: result.score,
    gaps:  result.missingSkills,
    why:   result.why,
  });
  em.persist(application);
  await em.flush();

  redirect(`/candidates/${candidate.id}?appId=${application.id}`);
}

export async function updateCandidate(id: number, formData: FormData) {
  const name      = String(formData.get("name")     ?? "").trim();
  const role      = String(formData.get("role")     ?? "").trim();
  const company   = String(formData.get("company")  ?? "").trim();
  const location  = String(formData.get("location") ?? "").trim();
  const email     = String(formData.get("email")    ?? "").trim() || undefined;
  const salary    = String(formData.get("salary")   ?? "").trim() || undefined;
  const rawSkills = String(formData.get("skills")   ?? "");

  if (!name || !role || !company || !location) {
    throw new Error("Champs obligatoires manquants");
  }

  const em        = await getEm();
  const candidate = await em.findOne(Candidate, { id });
  if (!candidate) throw new Error("Candidat introuvable");

  const manualSkills    = parseManualSkills(rawSkills);
  const extractedSkills = extractSkillsFromText(String(formData.get("cvText") ?? ""));
  const skills          = mergeSkills(manualSkills, extractedSkills);

  em.assign(candidate, { name, role, company, location, email, salary, skills });

  // Rescore all applications for this candidate
  const applications = await em.find(Application, { candidate: { id } }, { populate: ["job"] });
  for (const app of applications) {
    const reqs = (app.job.requirements as string[] | null) ?? [];
    const base  = scoreCandidate({ candidateSkills: skills, jobRequirements: reqs });

    const notes    = app.notes?.trim();
    const analysis = notes ? analyzeInterviewNotes(notes) : null;
    const delta    = notesScoreDelta(analysis);
    const adjusted = Math.max(0, Math.min(100, base.score + delta));
    const fit      = scoreToFit(adjusted);

    let why = buildWhy(adjusted, fit, base.matchedSkills, base.missingSkills, skills);
    if (delta !== 0 && analysis) {
      const sign  = delta > 0 ? `+${delta}` : `${delta}`;
      const label = analysis.tendency === "positive" ? "positifs" : "négatifs";
      why += ` Entretien : signaux ${label} (${sign} pts).`;
    }
    em.assign(app, { score: adjusted, gaps: base.missingSkills, why });
  }

  await em.flush();
  revalidatePath(`/candidates/${id}`);

  redirect(`/candidates/${id}`);
}

export async function updateApplicationNotes(applicationId: number, notes: string) {
  const em  = await getEm();
  const app = await em.findOne(Application, { id: applicationId }, { populate: ["candidate", "job"] });
  if (!app) throw new Error("Application introuvable");

  const skills = (app.candidate.skills as string[] | null) ?? [];
  const reqs   = (app.job.requirements  as string[] | null) ?? [];

  const base     = scoreCandidate({ candidateSkills: skills, jobRequirements: reqs });
  const trimmed  = notes.trim() || undefined;
  const analysis = trimmed ? analyzeInterviewNotes(trimmed) : null;
  const delta    = notesScoreDelta(analysis);

  const adjusted = Math.max(0, Math.min(100, base.score + delta));
  const fit      = scoreToFit(adjusted);

  let why = buildWhy(adjusted, fit, base.matchedSkills, base.missingSkills, skills);
  if (delta !== 0 && analysis) {
    const sign  = delta > 0 ? `+${delta}` : `${delta}`;
    const label = analysis.tendency === "positive" ? "positifs" : "négatifs";
    why += ` Entretien : signaux ${label} (${sign} pts).`;
  }

  em.assign(app, { notes: trimmed, score: adjusted, why });
  await em.flush();
  revalidatePath(`/candidates/${app.candidate.id}`);

}

export async function updateApplicationStage(applicationId: number, stageIndex: number) {
  const em  = await getEm();
  const app = await em.findOne(Application, { id: applicationId }, { populate: ["candidate", "job"] });
  if (!app) throw new Error("Application introuvable");

  const rawStages = app.job.stages as string[] | null | undefined;
  const stages    = rawStages?.length ? rawStages : [];
  const jobMax    = app.job.currentStageIndex ?? stages.length - 1;
  const idx       = Math.max(0, Math.min(stageIndex, stages.length - 1, jobMax));

  em.assign(app, { stageIndex: idx, movedAt: new Date() });
  await em.flush();
  revalidatePath(`/candidates/${app.candidate.id}`);
}


export async function deleteCandidate(id: number) {
  const em        = await getEm();
  const candidate = await em.findOne(Candidate, { id });
  if (!candidate) throw new Error("Candidat introuvable");

  await em.nativeDelete(Application, { candidate: { id } });
  em.remove(candidate);
  await em.flush();

  revalidatePath("/jobs");
  redirect("/candidates");
}

export async function addApplicationToJob(candidateId: number, jobId: number) {
  const em = await getEm();
  const [candidate, job] = await Promise.all([
    em.findOne(Candidate, { id: candidateId }),
    em.findOne(Job, { id: jobId }),
  ]);
  if (!candidate) throw new Error("Candidat introuvable");
  if (!job) throw new Error("Poste introuvable");

  const skills = (candidate.skills as string[] | null) ?? [];
  const reqs   = (job.requirements  as string[] | null) ?? [];
  const result = scoreCandidate({ candidateSkills: skills, jobRequirements: reqs });

  const application = em.create(Application, {
    candidate, job,
    score: result.score,
    gaps:  result.missingSkills,
    why:   result.why,
  });
  em.persist(application);
  await em.flush();

  revalidatePath(`/candidates/${candidateId}`);
  redirect(`/candidates/${candidateId}?appId=${application.id}`);
}

export async function deleteApplication(applicationId: number) {
  const em  = await getEm();
  const app = await em.findOne(Application, { id: applicationId }, { populate: ["candidate"] });
  if (!app) throw new Error("Application introuvable");

  const candidateId = app.candidate.id;
  em.remove(app);
  await em.flush();
  revalidatePath(`/candidates/${candidateId}`);

  redirect(`/candidates/${candidateId}`);
}

export async function updateCandidateTags(id: number, tags: string[]) {
  const em        = await getEm();
  const candidate = await getCandidateById(id);
  if (!candidate) throw new Error("Candidat introuvable");

  const ref = em.getReference(Candidate, id);
  em.assign(ref, { tags });
  await em.flush();
}
