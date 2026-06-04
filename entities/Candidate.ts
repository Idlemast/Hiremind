import { EntitySchema, Collection } from "@mikro-orm/sqlite";
import { JsonType, OptionalProps } from "@mikro-orm/core";
import type { Application } from "./Application";

export class Candidate {
  [OptionalProps]?: "skills" | "tags" | "appliedAt" | "applications" | "salt";
  id!: number;
  salt?: string;
  name!: string;
  role!: string;
  company!: string;
  location!: string;
  email?: string;
  source!: string;
  salary?: string;
  skills: string[] = [];
  tags: string[] = [];
  appliedAt: Date = new Date();
  applications = new Collection<Application>(this);
}

export const CandidateSchema = new EntitySchema({
  class: Candidate,
  properties: {
    id:        { primary: true, autoincrement: true, type: "integer" },
    salt:      { type: "string", nullable: true },
    name:      { type: "string" },
    role:      { type: "string" },
    company:   { type: "string" },
    location:  { type: "string" },
    email:     { type: "string", nullable: true },
    source:    { type: "string" },
    salary:    { type: "string", nullable: true },
    skills:    { type: JsonType, nullable: true },
    tags:      { type: JsonType, nullable: true },
    appliedAt: { type: "Date", fieldName: "applied_at", defaultRaw: "CURRENT_TIMESTAMP" },
    applications: { kind: "1:m", entity: "Application", mappedBy: "candidate" },
  },
});
