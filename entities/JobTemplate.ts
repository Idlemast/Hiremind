import { EntitySchema } from "@mikro-orm/sqlite";
import { JsonType, OptionalProps } from "@mikro-orm/core";

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
