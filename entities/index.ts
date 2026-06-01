import { EntitySchema, Collection } from "@mikro-orm/sqlite";
import { JsonType, OptionalProps } from "@mikro-orm/core";

// ── JobTemplate ──────────────────────────────────────────────────────────────

export class JobTemplate {
  [OptionalProps]?: "createdAt" | "requirements" | "stages";
  id!: number;
  name!: string;
  title!: string;
  department!: string;
  location!: string;
  icon!: string;
  iconBg!: string;
  requirements: string[] = [];
  stages: string[] = [];
  createdAt: Date = new Date();
}

export const JobTemplateSchema = new EntitySchema({
  class: JobTemplate,
  tableName: "job_template",
  properties: {
    id:           { primary: true, autoincrement: true, type: "integer" },
    name:         { type: "string" },
    title:        { type: "string" },
    department:   { type: "string" },
    location:     { type: "string" },
    icon:         { type: "string" },
    iconBg:       { type: "string", fieldName: "icon_bg", length: 200 },
    requirements: { type: JsonType, nullable: true },
    stages:       { type: JsonType, nullable: true },
    createdAt:    { type: "Date", fieldName: "created_at", defaultRaw: "CURRENT_TIMESTAMP" },
  },
});

// ── Setting ───────────────────────────────────────────────────────────────────

export class Setting {
  key!: string;
  value!: string;
}

export const SettingSchema = new EntitySchema({
  class: Setting,
  tableName: "setting",
  properties: {
    key:   { primary: true, type: "string" },
    value: { type: "text" },
  },
});

// ── Classes ──────────────────────────────────────────────────────────────────

export class Job {
  [OptionalProps]?: "progress" | "openedAt" | "candidates" | "requirements" | "stages" | "currentStageIndex" | "budget" | "status";
  id!: number;
  title!: string;
  department!: string;
  location!: string;
  stage!: string;
  icon!: string;
  iconBg!: string;
  progress: number = 0;
  openedAt: Date = new Date();
  requirements: string[] = [];
  stages: string[] = [];
  currentStageIndex: number = 0;
  budget?: string;
  status: string = "open";
  candidates = new Collection<Candidate>(this);
}

export class Candidate {
  [OptionalProps]?: "skills" | "gaps" | "tags" | "appliedAt" | "stageIndex";
  id!: number;
  name!: string;
  role!: string;
  company!: string;
  location!: string;
  email?: string;
  notes?: string;
  fitOverride?: string;
  fit!: string;
  score!: number;
  skills: string[] = [];
  gaps: string[] = [];
  why?: string;
  tags: string[] = [];
  source!: string;
  salary?: string;
  stageIndex: number = 0;
  appliedAt: Date = new Date();
  job!: Job;
}

// ── Schemas ───────────────────────────────────────────────────────────────────

export const JobSchema = new EntitySchema({
  class: Job,
  properties: {
    id:         { primary: true, autoincrement: true, type: "integer" },
    title:      { type: "string" },
    department: { type: "string" },
    location:   { type: "string" },
    stage:      { type: "string" },
    icon:       { type: "string" },
    iconBg:     { type: "string", length: 200 },
    progress:          { type: "integer", default: 0 },
    openedAt:          { type: "Date", defaultRaw: "CURRENT_TIMESTAMP" },
    requirements:      { type: JsonType, nullable: true },
    stages:            { type: JsonType, nullable: true },
    currentStageIndex: { type: "integer", default: 0, fieldName: "current_stage_index" },
    budget:            { type: "string", nullable: true },
    status:            { type: "string", default: "open" },
    candidates:        { kind: "1:m", entity: () => Candidate, mappedBy: "job" },
  },
});

export const CandidateSchema = new EntitySchema({
  class: Candidate,
  properties: {
    id:        { primary: true, autoincrement: true, type: "integer" },
    name:      { type: "string" },
    role:      { type: "string" },
    company:   { type: "string" },
    location:  { type: "string" },
    email:       { type: "string", nullable: true },
    notes:       { type: "text",   nullable: true },
    fitOverride: { type: "string", nullable: true, fieldName: "fit_override" },
    fit:         { type: "string" },
    score:     { type: "integer" },
    skills:    { type: JsonType, nullable: true },
    gaps:      { type: JsonType, nullable: true },
    why:       { type: "text", nullable: true },
    tags:      { type: JsonType, nullable: true },
    source:     { type: "string" },
    salary:     { type: "string", nullable: true },
    stageIndex: { type: "integer", default: 0, fieldName: "stage_index" },
    appliedAt:  { type: "Date", defaultRaw: "CURRENT_TIMESTAMP" },
    job:        { kind: "m:1", entity: () => Job },
  },
});
