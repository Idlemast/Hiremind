"use server";

import { revalidatePath } from "next/cache";
import { getEm } from "@/lib/db";
import { Integration } from "@/entities/index";

// Toggling/syncing here only flips local DB state — no real Greenhouse/Lever/Workday
// API is ever called (HireMind has no auth or external API credentials). See AGENTS.md.

export async function toggleIntegrationActive(id: number) {
  const em = await getEm();
  const integration = await em.findOne(Integration, { id });
  if (!integration) throw new Error("Intégration introuvable");
  em.assign(integration, { active: !integration.active });
  await em.flush();
  revalidatePath("/integrations");
}

export async function syncIntegrationNow(id: number) {
  const em = await getEm();
  em.assign(em.getReference(Integration, id), { lastSyncAt: new Date() });
  await em.flush();
  revalidatePath("/integrations");
}
