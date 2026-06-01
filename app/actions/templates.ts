"use server";

import { revalidatePath } from "next/cache";
import { getEm, getJobById } from "@/lib/db";
import { JobTemplate } from "@/entities/index";

export async function saveAsTemplate(jobId: number, name: string) {
  if (!name.trim()) throw new Error("Le nom du template est requis");

  const job = await getJobById(jobId);
  if (!job) throw new Error("Job introuvable");

  const em = await getEm();
  em.persist(em.create(JobTemplate, {
    name:         name.trim(),
    title:        job.title,
    department:   job.department,
    location:     job.location,
    icon:         job.icon,
    iconBg:       job.iconBg,
    requirements: (job.requirements as string[] | null) ?? [],
    stages:       (job.stages as string[] | null) ?? [],
  }));
  await em.flush();

  revalidatePath("/jobs/new");
}

export async function deleteTemplate(id: number) {
  const em  = await getEm();
  const ref = em.getReference(JobTemplate, id);
  em.remove(ref);
  await em.flush();

  revalidatePath("/jobs/new");
}
