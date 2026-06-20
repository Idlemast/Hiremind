import { EntitySchema } from "@mikro-orm/sqlite";
import { JsonType, OptionalProps } from "@mikro-orm/core";
import { Candidate } from "./Candidate";
import { Job } from "./Job";

export class Application {
  [OptionalProps]?: "gaps" | "why" | "notes" | "stageIndex" | "appliedAt" | "movedAt" | "hired";
  id!: number;
  candidate!: Candidate;
  job!: Job;
  score!: number;
  gaps: string[] = [];
  why?: string;
  notes?: string;
  stageIndex: number = 0;
  appliedAt: Date = new Date();
  movedAt?: Date;
  hired: boolean = false;
}

export const ApplicationSchema = new EntitySchema({
  class: Application,
  tableName: "application",
  properties: {
    id:         { primary: true, autoincrement: true, type: "integer" },
    candidate:  { kind: "m:1", entity: () => Candidate },
    job:        { kind: "m:1", entity: () => Job },
    score:      { type: "integer" },
    gaps:       { type: JsonType, nullable: true },
    why:        { type: "text", nullable: true },
    notes:      { type: "text", nullable: true },
    stageIndex:       { type: "integer", default: 0, fieldName: "stage_index" },
    appliedAt:        { type: "Date",    fieldName: "applied_at",        defaultRaw: "CURRENT_TIMESTAMP" },
    movedAt:          { type: "Date",    fieldName: "moved_at",  nullable: true },
    hired:            { type: "boolean", default: false },
  },
});
