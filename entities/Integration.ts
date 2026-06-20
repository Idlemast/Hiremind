import { EntitySchema } from "@mikro-orm/sqlite";
import { OptionalProps } from "@mikro-orm/core";

export class Integration {
  [OptionalProps]?: "active" | "autoSync";
  id!: number;
  name!: string;
  description!: string;
  active: boolean = false;
  autoSync: boolean = false;
  lastSyncAt?: Date;
}

export const IntegrationSchema = new EntitySchema({
  class: Integration,
  tableName: "integration",
  properties: {
    id:          { primary: true, autoincrement: true, type: "integer" },
    name:        { type: "string" },
    description: { type: "string" },
    active:      { type: "boolean", default: false },
    autoSync:    { type: "boolean", default: false, fieldName: "auto_sync" },
    lastSyncAt:  { type: "Date",    fieldName: "last_sync_at", nullable: true },
  },
});
