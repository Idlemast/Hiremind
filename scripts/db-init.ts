import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "hiremind.db");

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = OFF");
db.exec("DROP TABLE IF EXISTS candidate; DROP TABLE IF EXISTS job;");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE job (
    id           INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    title        TEXT    NOT NULL,
    department   TEXT    NOT NULL,
    location     TEXT    NOT NULL,
    stage        TEXT    NOT NULL,
    icon         TEXT    NOT NULL,
    icon_bg      TEXT    NOT NULL,
    progress            INTEGER NOT NULL DEFAULT 0,
    opened_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    requirements        TEXT    NULL,
    stages              TEXT    NULL,
    current_stage_index INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE candidate (
    id         INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    role       TEXT    NOT NULL,
    company    TEXT    NOT NULL,
    location   TEXT    NOT NULL,
    fit        TEXT    NOT NULL,
    score      INTEGER NOT NULL,
    skills     TEXT    NULL,
    gaps       TEXT    NULL,
    why        TEXT    NULL,
    tags       TEXT    NULL,
    source     TEXT    NOT NULL,
    salary     TEXT    NULL,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    job_id     INTEGER NOT NULL,
    CONSTRAINT candidate_job_id_foreign
      FOREIGN KEY (job_id) REFERENCES job (id)
  );

  CREATE INDEX candidate_job_id_index ON candidate (job_id);

  CREATE TABLE job_template (
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

  CREATE TABLE setting (
    key   TEXT NOT NULL PRIMARY KEY,
    value TEXT NOT NULL
  );

  INSERT INTO setting (key, value) VALUES
    ('threshold_strong', '80'),
    ('threshold_medium', '55');
`);

db.close();
console.log("✓ Database schema created at", dbPath);
