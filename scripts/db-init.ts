import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "hiremind.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = OFF");
db.exec(`
  DROP TABLE IF EXISTS application;
  DROP TABLE IF EXISTS candidate;
  DROP TABLE IF EXISTS job;
  DROP TABLE IF EXISTS job_template;
  DROP TABLE IF EXISTS setting;
`);
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE job (
    id                  INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,
    title               TEXT     NOT NULL,
    department          TEXT     NOT NULL,
    location            TEXT     NOT NULL,
    stage               TEXT     NOT NULL,
    icon                TEXT     NOT NULL,
    icon_bg             TEXT     NOT NULL,
    progress            INTEGER  NOT NULL DEFAULT 0,
    opened_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    requirements        TEXT     NULL,
    stages              TEXT     NULL,
    current_stage_index INTEGER  NOT NULL DEFAULT 0,
    budget              TEXT     NULL,
    status              TEXT     NOT NULL DEFAULT 'open'
  );

  CREATE TABLE candidate (
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
  );

  CREATE TABLE application (
    id           INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER  NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
    job_id       INTEGER  NOT NULL REFERENCES job(id)       ON DELETE CASCADE,
    score        INTEGER  NOT NULL DEFAULT 0,
    fit          TEXT     NOT NULL DEFAULT 'weak',
    gaps         TEXT     NULL,
    why          TEXT     NULL,
    notes        TEXT     NULL,
    stage_index  INTEGER  NOT NULL DEFAULT 0,
    applied_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(candidate_id, job_id)
  );

  CREATE TABLE IF NOT EXISTS job_template (
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
  );

  CREATE TABLE IF NOT EXISTS setting (
    key   TEXT NOT NULL PRIMARY KEY,
    value TEXT NOT NULL
  );

  INSERT INTO setting (key, value) VALUES
    ('threshold_strong', '80'),
    ('threshold_medium', '55');
`);

db.close();
console.log("✓ Database schema created at", dbPath);
