import cancelKeyboard from "../keyboards/cancelKeyboard.js";
import { knex } from "../../src/models/index.js";
import { Scenes } from "telegraf";

const roomJoin = new Scenes.BaseScene("roomJoin");

roomJoin.enter(async (ctx) => {
  const isInRoom = await knex("members").where({ user_id: ctx.update.message.from.id }).first();

  if (isInRoom) {
    await ctx.reply("В данный момент вы находитесь в комнате.\nИспользуйте команду /leave чтобы покинуть комнату.");
    return ctx.scene.leave();
  }

  const { message_id } = await ctx.reply("Укажите ключ комнаты", cancelKeyboard);

  ctx.scene.state.welcomeMessage = message_id;
});

roomJoin.action("cancel", (ctx) => ctx.scene.leave());

roomJoin.drop(async (ctx) => {
  try {
    const failedTry = () => {
      if (!ctx.scene.state.tries) ctx.scene.state.tries = 0;
      if (ctx.scene.state.tries >= 2) {
        ctx.reply("Попробуйте позже");
        return ctx.scene.leave();
      }

      ctx.scene.state.tries += 1;

      return ctx.reply("Комната не найдена");
    };

    if (!ctx.update.message.text) return failedTry();

    const room = await knex("rooms").where({ key: ctx.update.message.text }).first();

    if (!room) return failedTry();

    await knex("members").insert({
      username: ctx.update.message.from.username || "username",
      user_id: ctx.update.message.from.id,
      room_id: room.id,
      role: "guest",
    });

    await ctx.reply("Вы вошли в комнату");

    return ctx.scene.leave();
  } catch (error) {
    console.log(error.message || error);
  }
});

roomJoin.leave((ctx) => ctx.deleteMessage(ctx.scene.state.welcomeMessage).catch((e) => console.log(e.message)));

export default roomJoin;
