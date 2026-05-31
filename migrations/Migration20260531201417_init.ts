import { Migration } from "@mikro-orm/migrations";

export class Migration20260531201417_init extends Migration {
  override isTransactional(): boolean {
    return false;
  }

  override up(): void {
    this.addSql(`
      create table if not exists \`job\` (
        \`id\`           integer not null primary key autoincrement,
        \`title\`        text    not null,
        \`department\`   text    not null,
        \`location\`     text    not null,
        \`stage\`        text    not null,
        \`icon\`         text    not null,
        \`icon_bg\`      text    not null,
        \`progress\`     integer not null default 0,
        \`opened_at\`    datetime not null default CURRENT_TIMESTAMP,
        \`requirements\` json    null
      );
    `);

    this.addSql(`
      create table if not exists \`candidate\` (
        \`id\`         integer not null primary key autoincrement,
        \`name\`       text    not null,
        \`role\`       text    not null,
        \`company\`    text    not null,
        \`location\`   text    not null,
        \`fit\`        text    not null,
        \`score\`      integer not null,
        \`skills\`     json    null,
        \`gaps\`       json    null,
        \`why\`        text    null,
        \`tags\`       json    null,
        \`source\`     text    not null,
        \`salary\`     text    null,
        \`applied_at\` datetime not null default CURRENT_TIMESTAMP,
        \`job_id\`     integer not null,
        constraint \`candidate_job_id_foreign\`
          foreign key (\`job_id\`) references \`job\` (\`id\`)
      );
    `);

    this.addSql(`create index if not exists \`candidate_job_id_index\` on \`candidate\` (\`job_id\`);`);
  }

  override down(): void {
    this.addSql(`drop table if exists \`candidate\`;`);
    this.addSql(`drop table if exists \`job\`;`);
  }
}
