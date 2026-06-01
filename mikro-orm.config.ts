import { defineConfig } from "@mikro-orm/sqlite";
import path from "path";
import { JobSchema, CandidateSchema, SettingSchema, JobTemplateSchema } from "./entities/index";

export default defineConfig({
  dbName: path.join(process.cwd(), "hiremind.db"),
  entities: [JobSchema, CandidateSchema, SettingSchema, JobTemplateSchema],
  migrations: {
    path: path.join(process.cwd(), "migrations"),
    glob: "!(*.d).{js,ts}",
  },
  debug: process.env.NODE_ENV === "development",
});
