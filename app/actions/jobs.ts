"use server";

import { redirect } from "next/navigation";
import { getEm } from "@/lib/db";
import { Job } from "@/entities/index";
import { parseManualSkills } from "@/lib/extract-skills";

export async function createJob(formData: FormData) {
  const title        = String(formData.get("title") ?? "").trim();
  const department   = String(formData.get("department") ?? "").trim();
  const location     = String(formData.get("location") ?? "").trim();
  const stage        = String(formData.get("stage") ?? "SOURCING");
  const icon         = String(formData.get("icon") ?? "work");
  const iconBg       = String(formData.get("iconBg") ?? "bg-slate-50 text-slate-600");
  const rawReqs      = String(formData.get("requirements") ?? "");

  if (!title || !department || !location) {
    throw new Error("Champs obligatoires manquants");
  }

  const requirements = parseManualSkills(rawReqs);

  const em = await getEm();
  const job = em.create(Job, { title, department, location, stage, icon, iconBg, requirements });
  em.persist(job);
  await em.flush();

  redirect(`/jobs`);
}
