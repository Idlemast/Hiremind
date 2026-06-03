"use server";

import { revalidatePath } from "next/cache";
import { saveThresholds } from "@/lib/db";

export async function updateThresholds(formData: FormData) {
  const strong = Math.min(100, Math.max(2, Number(formData.get("strong"))));
  const medium = Math.min(strong - 1, Math.max(1, Number(formData.get("medium"))));
  await saveThresholds(strong, medium);
  revalidatePath("/candidates", "layout");
  revalidatePath("/settings");
}
