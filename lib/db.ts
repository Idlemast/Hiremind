import { MikroORM, type EntityManager } from "@mikro-orm/sqlite";
import { cache } from "react";
import config from "../mikro-orm.config";
import { Job, Candidate, Application, Setting, JobTemplate } from "../entities/index";
import { scoreToFit, DEFAULT_THRESHOLDS, type Thresholds } from "./thresholds";
import { generateSalt } from "./slugify";

async function uniqueSalt(conn: { execute(sql: string, params?: unknown[]): Promise<unknown> }, table: string): Promise<string> {
  while (true) {
    const s = generateSalt();
    const rows = await conn.execute(`SELECT 1 FROM ${table} WHERE salt = ?`, [s]) as unknown[];
    if (rows.length === 0) return s;
  }
}

const getOrm = cache(async (): Promise<MikroORM> => {
  const orm  = await MikroORM.init(config);
  const conn = orm.em.getConnection();

  await conn.execute(`CREATE TABLE IF NOT EXISTS setting (key TEXT NOT NULL PRIMARY KEY, value TEXT NOT NULL)`);

  // Create application table (m:n schema)
  await conn.execute(`CREATE TABLE IF NOT EXISTS application (
    id           INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER  NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
    job_id       INTEGER  NOT NULL REFERENCES job(id)       ON DELETE CASCADE,
    score        INTEGER  NOT NULL DEFAULT 0,
    gaps         TEXT     NULL,
    why          TEXT     NULL,
    notes        TEXT     NULL,
    stage_index  INTEGER  NOT NULL DEFAULT 0,
    applied_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(candidate_id, job_id)
  )`);

  // Indexes for foreign key lookups (no-op if already present)
  await conn.execute(`CREATE INDEX IF NOT EXISTS idx_application_job_id       ON application(job_id)`);
  await conn.execute(`CREATE INDEX IF NOT EXISTS idx_application_candidate_id ON application(candidate_id)`);

  // Migrate from m:1 schema if candidate.job_id still exists
  const colInfo = await conn.execute(`PRAGMA table_info(candidate)`) as { name: string }[];
  const hasJobId = colInfo.some((c) => c.name === "job_id");
  if (hasJobId) {
    await conn.execute(`INSERT OR IGNORE INTO application
      (candidate_id, job_id, score, fit, gaps, why, notes, stage_index, applied_at)
      SELECT id, job_id, COALESCE(score, 0), COALESCE(fit, 'weak'),
             gaps, why, notes, COALESCE(stage_index, 0), applied_at
      FROM candidate WHERE job_id IS NOT NULL`);
    await conn.execute(`ALTER TABLE candidate RENAME TO _candidate_old`);
    await conn.execute(`CREATE TABLE candidate (
      id         INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,
      name       TEXT     NOT NULL,
      role       TEXT     NOT NULL,
      company    TEXT     NOT NULL,
      location   TEXT     NOT NULL,
      email      TEXT     NULL,
      source     TEXT     NOT NULL DEFAULT 'Manual',
      salary     TEXT     NULL,
      skills     TEXT     NULL,
      tags       TEXT     NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    await conn.execute(`INSERT INTO candidate (id, name, role, company, location, email, source, salary, skills, tags, applied_at)
      SELECT id, name, role, company, location, email,
             COALESCE(source, 'Manual'), salary, skills, tags, applied_at
      FROM _candidate_old`);
    await conn.execute(`DROP TABLE _candidate_old`);
  }

  // Column additions — ignore "duplicate column" but surface real errors
  const addCol = async (sql: string) => {
    try { await conn.execute(sql); } catch (err: any) {
      if (!err?.message?.includes("duplicate column")) console.error("[db] schema migration failed:", err?.message ?? err);
    }
  };

  await addCol(`ALTER TABLE application ADD COLUMN moved_at DATETIME NULL`);
  await addCol(`ALTER TABLE job ADD COLUMN stages TEXT NULL`);
  await addCol(`ALTER TABLE job ADD COLUMN current_stage_index INTEGER NOT NULL DEFAULT 0`);
  await addCol(`ALTER TABLE job ADD COLUMN budget TEXT NULL`);
  await addCol(`ALTER TABLE job ADD COLUMN status TEXT NOT NULL DEFAULT 'open'`);
  await addCol(`ALTER TABLE job ADD COLUMN salt TEXT NULL`);
  await addCol(`ALTER TABLE candidate ADD COLUMN salt TEXT NULL`);

  await conn.execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_job_salt ON job(salt) WHERE salt IS NOT NULL`);
  await conn.execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_candidate_salt ON candidate(salt) WHERE salt IS NOT NULL`);

  const jobsNoSalt = await conn.execute("SELECT id FROM job WHERE salt IS NULL") as { id: number }[];
  for (const row of jobsNoSalt) {
    await conn.execute("UPDATE job SET salt = ? WHERE id = ?", [await uniqueSalt(conn, "job"), row.id]);
  }
  const candidatesNoSalt = await conn.execute("SELECT id FROM candidate WHERE salt IS NULL") as { id: number }[];
  for (const row of candidatesNoSalt) {
    await conn.execute("UPDATE candidate SET salt = ? WHERE id = ?", [await uniqueSalt(conn, "candidate"), row.id]);
  }

  await conn.execute(`CREATE TABLE IF NOT EXISTS job_template (
    id           INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,
    name         TEXT     NOT NULL,
    title        TEXT     NOT NULL,
    department   TEXT     NOT NULL,
    location     TEXT     NOT NULL,
    icon         TEXT     NOT NULL,
    icon_bg      TEXT     NOT NULL,
    requirements TEXT     NULL,
    stages       TEXT     NULL,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  return orm;
});

export async function getEm(): Promise<EntityManager> {
  return (await getOrm()).em.fork();
}

// ── Query helpers ─────────────────────────────────────────────────────────────

export async function getJobs(q?: string) {
  const em = await getEm();
  const where = q
    ? { $or: [
        { title:      { $like: `%${q}%` } },
        { department: { $like: `%${q}%` } },
        { location:   { $like: `%${q}%` } },
      ] }
    : {};
  return em.find(Job, where, { orderBy: { openedAt: "DESC" } });
}

export async function getJobById(id: number) {
  const em = await getEm();
  return em.findOne(Job, { id });
}

export async function createUniqueJobSalt(): Promise<string> {
  return uniqueSalt((await getEm()).getConnection(), "job");
}

export async function createUniqueCandidateSalt(): Promise<string> {
  return uniqueSalt((await getEm()).getConnection(), "candidate");
}

export async function getJobBySalt(salt: string) {
  const em = await getEm();
  return em.findOne(Job, { salt });
}

export async function getCandidateBySalt(salt: string) {
  const em = await getEm();
  return em.findOne(Candidate, { salt });
}

export async function getApplications(jobId?: number, candidateId?: number) {
  const em    = await getEm();
  const where: Record<string, unknown> = {};
  if (jobId)       where.job       = { id: jobId };
  if (candidateId) where.candidate = { id: candidateId };
  return em.find(Application, where, {
    populate:  ["candidate", "job"],
    orderBy:   { score: "DESC" },
  });
}

export async function getApplicationById(id: number) {
  const em = await getEm();
  return em.findOne(Application, { id }, { populate: ["candidate", "job"] });
}

export async function getCandidateById(id: number) {
  const em = await getEm();
  return em.findOne(Candidate, { id });
}

export async function getApplicationCountsByJob(): Promise<Record<number, number>> {
  const em   = await getEm();
  const conn = em.getConnection();
  const rows = await conn.execute(
    "SELECT job_id, COUNT(*) as cnt FROM application GROUP BY job_id"
  ) as { job_id: number; cnt: number }[];
  const counts: Record<number, number> = {};
  for (const row of rows) counts[row.job_id] = row.cnt;
  return counts;
}

export async function getThresholds(): Promise<Thresholds> {
  const em   = await getEm();
  const rows = await em.find(Setting, { key: { $in: ["threshold_strong", "threshold_medium"] } });
  const map: Record<string, number> = {};
  for (const r of rows) map[r.key] = Number(r.value);
  return {
    strong: map["threshold_strong"] ?? DEFAULT_THRESHOLDS.strong,
    medium: map["threshold_medium"] ?? DEFAULT_THRESHOLDS.medium,
  };
}

export async function getTemplates() {
  const em   = await getEm();
  const rows = await em.find(JobTemplate, {}, { orderBy: { createdAt: "DESC" } });
  return rows.map((t) => ({
    id:           t.id,
    name:         t.name,
    title:        t.title,
    department:   t.department,
    location:     t.location,
    icon:         t.icon,
    iconBg:       t.iconBg,
    requirements: (t.requirements as string[] | null) ?? [],
    stages:       (t.stages       as string[] | null) ?? [],
  }));
}

// ── Paginated application query (filters + sort in SQL) ──────────────────────

export async function getApplicationsPage(
  jobId: number,
  opts: { q?: string; sort?: string; page?: number; pageSize?: number },
): Promise<{ items: Application[]; total: number }> {
  const em = await getEm();
  const { q = "", sort = "score", page = 1, pageSize = 20 } = opts;

  const where: Record<string, unknown> = { job: { id: jobId } };
  if (q) {
    where.$or = [
      { candidate: { name: { $like: `%${q}%` } } },
      { candidate: { role: { $like: `%${q}%` } } },
    ];
  }

  const orderBy =
    sort === "name"   ? { candidate: { name: "ASC"  as const } } :
    sort === "recent" ? { appliedAt:  "DESC" as const } :
                        { score:      "DESC" as const };

  const [items, total] = await Promise.all([
    em.find(Application, where as any, {
      populate: ["candidate", "job"],
      orderBy,
      limit:  pageSize,
      offset: (page - 1) * pageSize,
    }),
    em.count(Application, where as any),
  ]);

  return { items, total };
}

// Lightweight stats: loads only scores via raw SQL, avoids full entity hydration
export async function getApplicationStatsByScore(
  jobId: number,
  thresholds: Thresholds,
): Promise<{ total: number; strong: number; medium: number; weak: number }> {
  const em   = await getEm();
  const conn = em.getConnection();
  const rows = await conn.execute(
    "SELECT score FROM application WHERE job_id = ?", [jobId]
  ) as { score: number }[];

  let strong = 0, medium = 0, weak = 0;
  for (const { score } of rows) {
    const fit = scoreToFit(score, thresholds);
    if      (fit === "strong") strong++;
    else if (fit === "medium") medium++;
    else                       weak++;
  }
  return { total: rows.length, strong, medium, weak };
}

// ── Lean dashboard query (no full entity hydration) ───────────────────────────

export async function getDashboardStats(thresholds: Thresholds): Promise<{
  total:      number;
  strong:     number;
  countByJob: Record<number, number>;
  topApp:     { id: number; candidateId: number; candidateSalt: string; candidateName: string; candidateCompany: string; jobId: number; jobSalt: string; jobTitle: string; score: number } | null;
}> {
  const em   = await getEm();
  const conn = em.getConnection();

  const scores = await conn.execute(
    "SELECT job_id, score FROM application"
  ) as { job_id: number; score: number }[];

  let totalStrong = 0;
  const countByJob: Record<number, number> = {};
  for (const { job_id, score } of scores) {
    countByJob[job_id] = (countByJob[job_id] ?? 0) + 1;
    if (scoreToFit(score, thresholds) === "strong") totalStrong++;
  }

  const topRows = await conn.execute(`
    SELECT a.id, a.candidate_id, a.job_id, a.score,
           c.name    AS candidate_name,
           c.salt    AS candidate_salt,
           c.company AS candidate_company,
           j.title   AS job_title,
           j.salt    AS job_salt
    FROM application a
    JOIN candidate c ON c.id = a.candidate_id
    JOIN job j       ON j.id = a.job_id
    WHERE a.score >= ?
    ORDER BY a.score DESC
    LIMIT 1
  `, [thresholds.strong]) as {
    id: number; candidate_id: number; job_id: number; score: number;
    candidate_name: string; candidate_salt: string; candidate_company: string; job_title: string; job_salt: string;
  }[];

  const topApp = topRows[0]
    ? { id: topRows[0].id, candidateId: topRows[0].candidate_id, candidateSalt: topRows[0].candidate_salt, candidateName: topRows[0].candidate_name, candidateCompany: topRows[0].candidate_company, jobId: topRows[0].job_id, jobSalt: topRows[0].job_salt, jobTitle: topRows[0].job_title, score: topRows[0].score }
    : null;

  return { total: scores.length, strong: totalStrong, countByJob, topApp };
}

// ── Lean stats query — all apps with only the fields needed by StatsClient ────

export async function getApplicationsLean(): Promise<{
  id:             number;
  candidateId:    number;
  candidateSalt:  string;
  candidateName:  string;
  jobId:         number;
  jobSalt:       string;
  jobTitle:      string;
  jobStages:     string[];
  stageIndex:    number;
  score:         number;
  source:        string;
  gaps:          string[];
  appliedAt:     string;
  movedAt:       string | null;
}[]> {
  const em   = await getEm();
  const conn = em.getConnection();

  const rows = await conn.execute(`
    SELECT a.id, a.candidate_id, a.job_id, a.score,
           a.stage_index, a.gaps, a.applied_at, a.moved_at,
           c.name AS candidate_name, c.salt AS candidate_salt, c.source,
           j.title AS job_title, j.salt AS job_salt, j.stages AS job_stages
    FROM application a
    JOIN candidate c ON c.id = a.candidate_id
    JOIN job j       ON j.id = a.job_id
    ORDER BY a.applied_at DESC
  `) as {
    id: number; candidate_id: number; job_id: number; score: number;
    stage_index: number; gaps: string | null; applied_at: string; moved_at: string | null;
    candidate_name: string; candidate_salt: string; source: string; job_title: string; job_salt: string; job_stages: string | null;
  }[];

  return rows.map((r) => ({
    id:             r.id,
    candidateId:    r.candidate_id,
    candidateSalt:  r.candidate_salt,
    candidateName:  r.candidate_name,
    jobId:         r.job_id,
    jobSalt:       r.job_salt,
    jobTitle:      r.job_title,
    jobStages:     r.job_stages   ? JSON.parse(r.job_stages)   : [],
    stageIndex:    r.stage_index,
    score:         r.score,
    source:        r.source || "Autre",
    gaps:          r.gaps         ? JSON.parse(r.gaps)         : [],
    appliedAt:     r.applied_at,
    movedAt:       r.moved_at,
  }));
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
