import { knex } from "./models/index.js";

const tables = [
  knex.schema.createTable("scenes", (table) => {
    table.increments("id").primary();
    table.string("title").notNullable();
    table.string("description");
    table.string("icon", 2);
    table.charset("utf8mb4");
    table.collate("utf8mb4_unicode_ci");
  }),
  knex.schema.createTable("rooms", (table) => {
    table.increments("id").primary();
    table.integer("scene").unsigned().references("scenes.id");
    table.string("key").notNullable();
    table.bigint("scene_expiration").unsigned().defaultTo(null);
    table.charset("utf8mb4");
    table.collate("utf8mb4_unicode_ci");
  }),
  knex.schema.createTable("members", (table) => {
    table.integer("room_id").unsigned().notNullable();
    table.bigint("user_id").unsigned().unique().notNullable();
    table.string("username").notNullable();
    table.enu("role", ["owner", "guest"]).notNullable();
    table.charset("utf8mb4");
    table.collate("utf8mb4_unicode_ci");
  }),
  knex.schema.createTable("messages", (table) => {
    table.integer("room_id").unsigned().notNullable();
    table.integer("scene_id").unsigned().references("scenes.id").notNullable();
    table.text("text").notNullable();
    table.charset("utf8mb4");
    table.collate("utf8mb4_unicode_ci");
  }),
];

(async () => {
  await Promise.all(
    tables.map((p) =>
      p.catch((e) => {
        if (e.code !== "ER_TABLE_EXISTS_ERROR") console.log(e.sqlMessage);
      })
    )
  );
})();
