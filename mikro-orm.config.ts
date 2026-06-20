import { defineConfig } from "@mikro-orm/sqlite";
import path from "path";
import { JobSchema, CandidateSchema, ApplicationSchema, SettingSchema, JobTemplateSchema, IntegrationSchema } from "./entities/index";

export default defineConfig({
  dbName: path.join(process.cwd(), "hiremind.db"),
  entities: [JobSchema, CandidateSchema, ApplicationSchema, SettingSchema, JobTemplateSchema, IntegrationSchema],
  debug: process.env.NODE_ENV === "development",
});
