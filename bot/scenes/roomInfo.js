import newSceneKeyboard from "../keyboards/newSceneKeyboard.js";
import timerKeyboard from "../keyboards/timerKeyboard.js";
import roomKeyboard from "../keyboards/roomKeyboard.js";
import sceneTimeout from "../helpers/sceneTimeout.js";
import { knex } from "../../src/models/index.js";
import leaveRoom from "../helpers/leaveRoom.js";
import { Scenes } from "telegraf";

const remainTime = (timestamp) => {
  const remainValue = (timestamp - Date.now()) / 1000;

  if (remainValue < 0) return "";

  const hours = Math.floor(remainValue / 60 / 60);

  const minutes = Math.floor(remainValue / 60) - hours * 60;

  const seconds = remainValue % 60;

  return minutes.toString().padStart(2, "0") + ":" + seconds.toFixed().padStart(2, "0");
};

const roomInfo = new Scenes.BaseScene("roomInfo");

roomInfo.enter(async (ctx) => {
  const currentRoom = await knex("members").where({ user_id: ctx.update.message.from.id }).first();

  if (!currentRoom) return ctx.reply("Воспользуйтесь командой /join чтобы присоединиться к команте или /create, чтобы создать новую");

  ctx.scene.state.roomId = currentRoom.room_id;
  ctx.scene.state.isOwner = currentRoom.role === "owner";

  const roomInfo = await knex({ m: "members" })
    .select("m.*", "r.key", "r.scene_expiration")
    .leftJoin({ r: "rooms" }, "r.id", "m.room_id")
    .where({ room_id: currentRoom.room_id });

  const { message_id } = ctx.replyWithHTML(
    `Текущая комната: <pre>${roomInfo[0].key}</pre>\nУчастников: ${roomInfo.length}${
      roomInfo[0].scene_expiration ? "\nВремя: " + remainTime(roomInfo[0].scene_expiration) : ""
    }`,
    roomKeyboard(
      roomInfo.map((u) => u.username),
      ctx.scene.state.isOwner,
      roomInfo[0].scene_expiration,
    )
  );
  ctx.scene.state.welcomeMessage = message_id;
});

roomInfo.action("toRoom", async (ctx) => {
  const roomInfo = await knex({ m: "members" })
    .select("m.*", "r.key")
    .leftJoin({ r: "rooms" }, "r.id", "m.room_id")
    .where({ room_id: ctx.scene.state.roomId });

  ctx.editMessageText(
    `Текущая комната: ${roomInfo[0].key}\nУчастников: ${roomInfo.length}`,
    roomKeyboard(
      roomInfo.map((u) => u.username),
      ctx.scene.state.isOwner
    )
  );
});

roomInfo.action(/^sceneId:.*/, async (ctx) => {
  ctx.scene.state.choosenScene = ctx.callbackQuery.data.split(":")[1];

  ctx.editMessageText("Установите таймер", timerKeyboard);
});

roomInfo.action(/^timer:.*/, async (ctx) => {
  const minutes = ctx.callbackQuery.data.split(":")[1];

  await knex("rooms")
    .where({ id: ctx.scene.state.roomId })
    .update({ scene: ctx.scene.state.choosenScene, scene_expiration: Date.now() + 1000 * 60 * minutes });

  sceneTimeout.setTimeout(ctx.scene.state.roomId, ctx.scene.state.choosenScene, minutes);

  ctx.scene.leave();
});

roomInfo.action("stopScene", async (ctx) => {
  await knex("rooms").where({ id: ctx.scene.state.roomId }).update({ scene: null, scene_expiration: null });

  const roomInfo = await knex({ m: "members" })
    .select("m.*", "r.key")
    .leftJoin({ r: "rooms" }, "r.id", "m.room_id")
    .where({ room_id: ctx.scene.state.roomId });

  sceneTimeout.removeTimeout(ctx.scene.state.roomId);

  ctx.editMessageText(
    `Текущая комната: ${roomInfo[0].key}\nУчастников: ${roomInfo.length}`,
    roomKeyboard(
      roomInfo.map((u) => u.username),
      ctx.scene.state.isOwner
    )
  );
});

roomInfo.action("initScene", async (ctx) => {
  const retroScenes = await knex("scenes");

  ctx.editMessageText("Выберите сцену", newSceneKeyboard(retroScenes));
});

roomInfo.action("finishEvent", (ctx) => ctx.scene.enter("roomConclusion"));

roomInfo.action("leave", async (ctx) => {
  await leaveRoom(ctx, ctx.callbackQuery.from.id);

  ctx.scene.leave();
});

roomInfo.action("cancel", (ctx) => ctx.scene.leave());

roomInfo.leave((ctx) => ctx.deleteMessage(ctx.scene.state.welcomeMessage).catch((e) => console.log(e.message)));

export default roomInfo;
