import { generateKey } from "../helpers/generateKey.js";
import { knex } from "../../src/models/index.js";
import { Scenes } from "telegraf";

const roomCreate = new Scenes.BaseScene("roomCreate");

roomCreate.enter(async (ctx) => {
  const isInRoom = await knex({ m: "members" })
    .where({ user_id: ctx.update.message.from.id })
    .leftJoin({ r: "rooms" }, "m.room_id", "r.id")
    .first();

  if (isInRoom) {
    await ctx.replyWithHTML(
      "В данный момент вы находитесь в комнате: <pre>" + isInRoom.key + "</pre>.\nИспользуйте команду /leave чтобы покинуть комнату."
    );
    return ctx.scene.leave();
  }

  const roomKey = await generateKey();
  const [id] = await knex("rooms").insert({ key: roomKey });

  await knex("members").insert({
    username: ctx.update.message.from.username || "username",
    user_id: ctx.update.message.from.id,
    role: "owner",
    room_id: id,
  });

  await ctx.replyWithHTML(`Комната создана, ключ для входа: <pre>${roomKey}</pre>`);

  return ctx.scene.leave();
});

export default roomCreate;
