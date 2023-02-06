import { knex } from "../../src/models/index.js";
import sendMessages from "./sendMessages.js";

export default async (ctx, user) => {
  const currentRoom = await knex("members").where({ user_id: user }).first();

  if (!currentRoom) return;

  const users = await knex("members").where({ room_id: currentRoom.room_id }).pluck("user_id");

  await knex("members")
    .modify((qb) => {
      if (currentRoom.role === "owner") qb.where({ room_id: currentRoom.room_id });
      else qb.where({ user_id: user });
    })
    .del();

  await ctx.reply("Вы вышли из комнаты");

  if (currentRoom.role === "owner") {
    await knex("rooms").where({ id: currentRoom.room_id }).del();
    await sendMessages(users, "Ваша комната распущена");
  }
};
