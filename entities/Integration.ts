import { EntitySchema } from "@mikro-orm/sqlite";
import { OptionalProps } from "@mikro-orm/core";

export class Integration {
  [OptionalProps]?: "active";
  id!: number;
  name!: string;
  description!: string;
  active: boolean = false;
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
    lastSyncAt:  { type: "Date",    fieldName: "last_sync_at", nullable: true },
  },
});
