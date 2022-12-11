import cancelKeyboard from "../keyboards/cancelKeyboard.js";
import sendMessages from "../helpers/sendMessages.js";
import { knex } from "../../src/models/index.js";
import leaveRoom from "../helpers/leaveRoom.js";
import { Scenes } from "telegraf";

const roomConclusion = new Scenes.BaseScene("roomConclusion");

roomConclusion.enter(async (ctx) => {
  const { message_id } = await ctx.reply(
    "Подробно опишите итоги данной ретроспективы.\nВаше сообщение увидят все участники комнаты.",
    cancelKeyboard
  );

  ctx.scene.state.welcomeMessage = message_id;
});

roomConclusion.action("cancel", (ctx) => ctx.scene.leave());

roomConclusion.drop(async (ctx) => {
  if (!ctx.update.message.text) return;

  const user = await knex("members").where({ user_id: ctx.update.message.from.id }).first();

  if (!user) return;

  const users = await knex("members").where({ room_id: user.room_id });

  await sendMessages(
    users.reduce((acc, u) => (u.role === "guest" ? [...acc, u.user_id] : acc), []),
    ctx.update.message.text
  );

  await leaveRoom(ctx, ctx.update.message.from.id);

  return ctx.scene.leave();
});

roomConclusion.leave((ctx) => ctx.deleteMessage(ctx.scene.state.welcomeMessage).catch((e) => console.log(e.message)));

export default roomConclusion;
