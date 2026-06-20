import { EntitySchema, Collection } from "@mikro-orm/sqlite";
import { JsonType, OptionalProps } from "@mikro-orm/core";
import { Application } from "./Application";

export class Job {
  [OptionalProps]?: "stage" | "progress" | "openedAt" | "applications" | "requirements" | "stages" | "currentStageIndex" | "budget" | "status" | "salt";
  id!: number;
  salt?: string;
  title!: string;
  department!: string;
  location!: string;
  // Derived from stages[currentStageIndex] — never read directly, see lib/stages.ts#currentStageName().
  // Column kept (like Application.fit) because SQLite can't cheaply drop it; always ignore its stored value.
  stage: string = "";
  icon!: string;
  iconBg!: string;
  // Derived from currentStageIndex/stages.length — see lib/stages.ts#deriveProgress(). Same caveat as `stage`.
  progress: number = 0;
  openedAt: Date = new Date();
  requirements: string[] = [];
  stages: string[] = [];
  currentStageIndex: number = 0;
  budget?: string;
  status: string = "open";
  applications = new Collection<Application>(this);
}

export const JobSchema = new EntitySchema({
  class: Job,
  properties: {
    id:         { primary: true, autoincrement: true, type: "integer" },
    salt:       { type: "string", nullable: true },
    title:      { type: "string" },
    department: { type: "string" },
    location:   { type: "string" },
    stage:      { type: "string", default: "" },
    icon:       { type: "string" },
    iconBg:     { type: "string", length: 200 },
    progress:          { type: "integer", default: 0 },
    openedAt:          { type: "Date", fieldName: "opened_at", defaultRaw: "CURRENT_TIMESTAMP" },
    requirements:      { type: JsonType, nullable: true },
    stages:            { type: JsonType, nullable: true },
    currentStageIndex: { type: "integer", default: 0, fieldName: "current_stage_index" },
    budget:            { type: "string", nullable: true },
    status:            { type: "string", default: "open" },
    applications:      { kind: "1:m", entity: () => Application, mappedBy: "job" },
  },
});
