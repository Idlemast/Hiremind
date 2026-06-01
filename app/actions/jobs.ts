"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getEm, getJobById } from "@/lib/db";
import { Job } from "@/entities/index";
import { parseManualSkills } from "@/lib/extract-skills";
import { DEFAULT_STAGES, deriveProgress } from "@/lib/stages";

export async function createJob(formData: FormData) {
  const title      = String(formData.get("title") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const location   = String(formData.get("location") ?? "").trim();
  const icon       = String(formData.get("icon") ?? "work");
  const iconBg     = String(formData.get("iconBg") ?? "bg-slate-50 text-slate-600");
  const rawReqs    = String(formData.get("requirements") ?? "");

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
    stages,
    currentStageIndex: 0,
    stage: stages[0],
    progress: 0,
  }));
  await em.flush();
  redirect(`/jobs`);
}

export async function setJobStage(jobId: number, stageIndex: number) {
  const em  = await getEm();
  const job = await getJobById(jobId);
  if (!job) throw new Error("Job introuvable");

  const rawStages = job.stages as string[] | null | undefined;
  const stages    = rawStages?.length ? rawStages : DEFAULT_STAGES;
  const idx    = Math.max(0, Math.min(stages.length - 1, stageIndex));

  em.assign(em.getReference(Job, jobId), {
    currentStageIndex: idx,
    stage:    stages[idx],
    progress: deriveProgress(idx, stages.length),
  });
  await em.flush();

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
}

export async function updateJobStages(jobId: number, stages: string[], currentStageIndex: number) {
  const em  = await getEm();
  const idx = Math.max(0, Math.min(stages.length - 1, currentStageIndex));

  em.assign(em.getReference(Job, jobId), {
    stages,
    currentStageIndex: idx,
    stage:    stages[idx] ?? "",
    progress: deriveProgress(idx, stages.length),
  });
  await em.flush();

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
}
