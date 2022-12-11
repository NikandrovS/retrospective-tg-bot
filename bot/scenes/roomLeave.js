import { generateKey } from "../helpers/generateKey.js";
import { knex } from "../../src/models/index.js";
import leaveRoom from "../helpers/leaveRoom.js";
import { Scenes } from "telegraf";

const roomLeave = new Scenes.BaseScene("roomLeave");

roomLeave.enter(async (ctx) => {
  await leaveRoom(ctx, ctx.update.message.from.id);

  return ctx.scene.leave();
});

export default roomLeave;
