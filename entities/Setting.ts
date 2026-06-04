import { EntitySchema } from "@mikro-orm/sqlite";

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
