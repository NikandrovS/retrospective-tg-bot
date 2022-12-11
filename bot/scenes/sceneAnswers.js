import sendMessagesWithKeyboard from "../helpers/sendMessagesWithKeyboard.js";
import sendMessages from "../helpers/sendMessages.js";
import { knex } from "../../src/models/index.js";
import { Scenes } from "telegraf";

const showSceneAnswers = new Scenes.BaseScene("showSceneAnswers");

showSceneAnswers.enter(async (ctx) => {
  const [_, room, scene, currentMessage] = ctx.callbackQuery.data.split(":");
  const offset = +currentMessage || 0;

  const message = await knex("messages").where({ room_id: room, scene_id: scene }).offset(offset).first();

  if (!message) return ctx.reply("Все сообщения прочитаны");

  const users = await knex("members").where({ room_id: room });

  if (!users.length) return;

  await sendMessages(
    users.reduce((acc, u) => (u.role === "guest" ? [...acc, u.user_id] : acc), []),
    message.text
  );

  await sendMessagesWithKeyboard(
    users.reduce((acc, u) => (u.role === "owner" ? [...acc, u.user_id] : acc), []),
    message.text,
    [[{ text: "Дальше »", callback_data: `showSceneAnswers:${room}:${scene}:${offset + 1}` }]]
  );

  return ctx.scene.leave();
});

export default showSceneAnswers;
