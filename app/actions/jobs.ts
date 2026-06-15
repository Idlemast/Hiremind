"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getEm, getJobById, createUniqueJobSalt } from "@/lib/db";
import { jobUrl } from "@/lib/slugify";
import { Job, Application } from "@/entities/index";
import { parseManualSkills } from "@/lib/extract-skills";
import { DEFAULT_STAGES, deriveProgress } from "@/lib/stages";
import { scoreCandidate, buildWhy } from "@/lib/triage";
import { scoreToFit } from "@/lib/thresholds";

export async function createJob(formData: FormData) {
  const title      = String(formData.get("title") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const location   = String(formData.get("location") ?? "").trim();
  const icon       = String(formData.get("icon") ?? "work");
  const iconBg     = String(formData.get("iconBg") ?? "bg-slate-50 text-slate-600");
  const rawReqs    = String(formData.get("requirements") ?? "");
  const budget     = String(formData.get("budget") ?? "").trim() || undefined;

  if (!title || !department || !location) throw new Error("Champs obligatoires manquants");

  const requirements = parseManualSkills(rawReqs);

  let stages: string[];
  try {
    const raw = JSON.parse(String(formData.get("stages") ?? "[]"));
    stages = Array.isArray(raw) && raw.length > 0 ? raw : DEFAULT_STAGES;
  } catch {
    stages = DEFAULT_STAGES;
  }

  const em = await getEm();
  em.persist(em.create(Job, {
    title, department, location, icon, iconBg, requirements,
    stages, currentStageIndex: 0, stage: stages[0], progress: 0, budget, status: "open",
    salt: await createUniqueJobSalt(),
  }));
  await em.flush();
  redirect(`/jobs`);
}

export async function updateJob(id: number, formData: FormData) {
  const title      = String(formData.get("title") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const location   = String(formData.get("location") ?? "").trim();
  const rawReqs    = String(formData.get("requirements") ?? "");
  const budget     = String(formData.get("budget") ?? "").trim() || undefined;
  const rescore    = formData.get("rescore") === "true";

  if (!title || !department || !location) throw new Error("Champs obligatoires manquants");

  const requirements = parseManualSkills(rawReqs);

  const em  = await getEm();
  const job = await getJobById(id);
  if (!job) throw new Error("Poste introuvable");

  em.assign(em.getReference(Job, id), { title, department, location, requirements, budget });

  if (rescore) {
    const apps = await em.find(Application, { job: { id } }, { populate: ["candidate"] });
    for (const app of apps) {
      const skills = (app.candidate.skills as string[] | null) ?? [];
      const result = scoreCandidate({ candidateSkills: skills, jobRequirements: requirements });
      const fit    = scoreToFit(result.score);
      const why    = buildWhy(result.score, fit, result.matchedSkills, result.missingSkills, skills);
      em.assign(app, { score: result.score, gaps: result.missingSkills, why });
    }
  }

  await em.flush();

  const url = jobUrl(job.salt!, title);
  revalidatePath(url);
  revalidatePath("/jobs");
  redirect(url);
}

export async function setJobStage(jobId: number, stageIndex: number) {
  const em  = await getEm();
  const job = await getJobById(jobId);
  if (!job) throw new Error("Job introuvable");

  const rawStages    = job.stages as string[] | null | undefined;
  const stages       = rawStages?.length ? rawStages : DEFAULT_STAGES;
  const prevIdx      = job.currentStageIndex ?? 0;
  const idx          = Math.max(0, Math.min(stages.length - 1, stageIndex));

  em.assign(em.getReference(Job, jobId), {
    currentStageIndex: idx,
    stage:    stages[idx],
    progress: deriveProgress(idx, stages.length),
  });

  // When moving backward, cap any applications that exceed the new job stage
  if (idx < prevIdx) {
    const apps = await em.find(Application, { job: { id: jobId } });
    for (const app of apps) {
      if (app.stageIndex > idx) em.assign(app, { stageIndex: idx, movedAt: new Date() });
    }
  }

  await em.flush();

  revalidatePath("/jobs");
  revalidatePath(jobUrl(job.salt!, job.title));
}

export async function updateJobStages(jobId: number, stages: string[], currentStageIndex: number) {
  const em  = await getEm();
  const job = await getJobById(jobId);
  if (!job) throw new Error("Job introuvable");

  const idx = Math.max(0, Math.min(stages.length - 1, currentStageIndex));
  em.assign(em.getReference(Job, jobId), {
    stages, currentStageIndex: idx, stage: stages[idx] ?? "", progress: deriveProgress(idx, stages.length),
  });
  await em.flush();

  revalidatePath("/jobs");
  revalidatePath(jobUrl(job.salt!, job.title));
}

async function setJobStatus(id: number, status: "open" | "closed") {
  const em  = await getEm();
  const job = await getJobById(id);
  if (!job) throw new Error("Poste introuvable");
  em.assign(em.getReference(Job, id), { status });
  await em.flush();
  revalidatePath(jobUrl(job.salt!, job.title));
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
}

export async function archiveJob(id: number)   { return setJobStatus(id, "closed"); }
export async function unarchiveJob(id: number) { return setJobStatus(id, "open"); }

export async function duplicateJob(id: number) {
  const em  = await getEm();
  const job = await getJobById(id);
  if (!job) throw new Error("Poste introuvable");

  const rawStages = job.stages as string[] | null | undefined;
  const stages    = rawStages?.length ? rawStages : DEFAULT_STAGES;

  const copySalt = await createUniqueJobSalt();
  const copy = em.create(Job, {
    title: `${job.title} (copie)`, department: job.department, location: job.location,
    icon: job.icon, iconBg: job.iconBg, requirements: job.requirements,
    stages, currentStageIndex: 0, stage: stages[0], progress: 0,
    budget: job.budget ?? undefined, status: "open", salt: copySalt,
  });
  em.persist(copy);
  await em.flush();

  revalidatePath("/jobs");
  redirect(`${jobUrl(copySalt, copy.title)}/edit`);
}

export async function deleteJob(id: number) {
  const em  = await getEm();
  const job = await em.findOne(Job, { id });
  if (!job) throw new Error("Poste introuvable");

  await em.nativeDelete(Application, { job: { id } });
  em.remove(job);
  await em.flush();

  revalidatePath("/jobs");

  revalidatePath("/dashboard");
  redirect("/jobs");
}
