"use server";

import { revalidatePath } from "next/cache";
import { getEm } from "@/lib/db";
import { Application } from "@/entities/index";

export async function scheduleInterview(appId: number, formData: FormData) {
  const at   = String(formData.get("at") ?? "");
  const link = String(formData.get("link") ?? "").trim() || undefined;
  if (!at) throw new Error("Date requise");

  const em = await getEm();
  em.assign(em.getReference(Application, appId), {
    interviewAt: new Date(at),
    interviewStatus: "pending",
    interviewLink: link,
  });
  await em.flush();
  revalidatePath("/interviews");
}

export async function rescheduleInterview(appId: number, formData: FormData) {
  const at = String(formData.get("at") ?? "");
  if (!at) throw new Error("Date requise");

  const em = await getEm();
  em.assign(em.getReference(Application, appId), {
    interviewAt: new Date(at),
    interviewStatus: "pending",
  });
  await em.flush();
  revalidatePath("/interviews");
}

export async function setInterviewStatus(appId: number, status: "pending" | "confirmed" | "reschedule") {
  const em = await getEm();
  em.assign(em.getReference(Application, appId), { interviewStatus: status });
  await em.flush();
  revalidatePath("/interviews");
}

export async function cancelInterview(appId: number) {
  const em = await getEm();
  em.assign(em.getReference(Application, appId), {
    interviewAt: undefined,
    interviewStatus: undefined,
    interviewLink: undefined,
  });
  await em.flush();
  revalidatePath("/interviews");
}
