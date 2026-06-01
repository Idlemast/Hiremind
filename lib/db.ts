import { MikroORM, type EntityManager } from "@mikro-orm/sqlite";
import config from "../mikro-orm.config";
import { Job, Candidate, Setting } from "../entities/index";
import { DEFAULT_THRESHOLDS, type Thresholds } from "./thresholds";

declare const globalThis: { orm?: MikroORM } & typeof global;

async function getOrm(): Promise<MikroORM> {
  if (!globalThis.orm) {
    globalThis.orm = await MikroORM.init(config);
    // Create setting table for existing DBs that pre-date the feature
    const conn = globalThis.orm.em.getConnection();
    await conn.execute(
      `CREATE TABLE IF NOT EXISTS setting (key TEXT NOT NULL PRIMARY KEY, value TEXT NOT NULL)`
    );
  }
  return globalThis.orm;
}

export async function getEm(): Promise<EntityManager> {
  const orm = await getOrm();
  return orm.em.fork();
}

// ── Query helpers ────────────────────────────────────────────────────────────

export async function getJobs() {
  const em = await getEm();
  return em.find(Job, {}, { populate: ["candidates"], orderBy: { openedAt: "DESC" } });
}

export async function getJobById(id: number) {
  const em = await getEm();
  return em.findOne(Job, { id }, { populate: ["candidates"] });
}

export async function getCandidates(jobId?: number) {
  const em = await getEm();
  const where = jobId ? { job: { id: jobId } } : {};
  return em.find(Candidate, where, { populate: ["job"], orderBy: { score: "DESC" } });
}

export async function getCandidateById(id: number) {
  const em = await getEm();
  return em.findOne(Candidate, { id }, { populate: ["job"] });
}

export async function getJobMeta() {
  const em = await getEm();
  const jobs = await em.find(Job, {}, { fields: ["department", "location"] });
  const departments = [...new Set(jobs.map((j) => j.department))].sort();
  const locations   = [...new Set(jobs.map((j) => j.location))].sort();
  return { departments, locations };
}

export async function getStats() {
  const em = await getEm();
  const [jobCount, candidateCount] = await Promise.all([
    em.count(Job),
    em.count(Candidate),
  ]);
  return { jobCount, candidateCount };
}

export async function getThresholds(): Promise<Thresholds> {
  const em = await getEm();
  const rows = await em.find(Setting, { key: { $in: ["threshold_strong", "threshold_medium"] } });
  const map: Record<string, number> = {};
  for (const r of rows) map[r.key] = Number(r.value);
  return {
    strong: map["threshold_strong"] ?? DEFAULT_THRESHOLDS.strong,
    medium: map["threshold_medium"] ?? DEFAULT_THRESHOLDS.medium,
  };
}

export async function saveThresholds(strong: number, medium: number): Promise<void> {
  const em = await getEm();
  for (const [key, value] of [["threshold_strong", strong], ["threshold_medium", medium]] as [string, number][]) {
    const existing = await em.findOne(Setting, { key });
    if (existing) {
      existing.value = String(value);
    } else {
      em.create(Setting, { key, value: String(value) });
    }
  }
  await em.flush();
}
