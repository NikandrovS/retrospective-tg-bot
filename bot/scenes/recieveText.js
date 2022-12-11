import { knex } from "../../src/models/index.js";

export default async (ctx) => {
  if (!ctx.update.message || !ctx.update.message.text) return;

  const user = await knex("members").where({ user_id: ctx.update.message.from.id }).first();

  if (!user) return;

  const room = await knex("rooms").where({ id: user.room_id }).first();

  if (!room || !room.scene) return;

  await knex("messages").insert({ room_id: room.id, scene_id: room.scene, text: ctx.update.message.text });

  return await ctx.reply("Сообщение принято");
};
