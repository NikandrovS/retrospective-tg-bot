import { knex } from "../../src/models/index.js";
import sendMessagesWithKeyboard from "./sendMessagesWithKeyboard.js";
import sendMessages from "./sendMessages.js";

const timerText = (timer) => {
  switch (true) {
    case timer === 1:
      return `${timer} минута`;
    case timer < 5:
      return `${timer} минуты`;
    default:
      return `${timer} минут`;
  }
};

const timeoutAlert = 1000 * 60 * 2;

class Timeout {
  constructor() {
    this.activeTimers = {};
  }

  async setTimeout(room, scene, timer) {
    this.removeTimeout(room);

    const sceneInfo = await knex("scenes").where({ id: scene }).first();

    const users = await knex("members").where({ room_id: room });

    if (!sceneInfo || !users.length) return;

    await sendMessages(
      users.map((u) => u.user_id),
      sceneInfo.description + "\n⏳ Таймер: " + timerText(timer)
    );

    this.activeTimers[room] = setTimeout(async () => {
      await sendMessages(
        users.map((u) => u.user_id),
        "⏳ Остается 2 минуты"
      );

      this.activeTimers[room] = setTimeout(async () => {
        try {
          await knex("rooms").where({ id: room }).update({ scene: null, scene_expiration: null });

          await sendMessages(
            users.reduce((acc, u) => (u.role === "guest" ? [...acc, u.user_id] : acc), []),
            "⌛️ Время вышло, смотрим ответы"
          );

          await sendMessagesWithKeyboard(
            users.reduce((acc, u) => (u.role === "owner" ? [...acc, u.user_id] : acc), []),
            "⌛️ Время вышло, смотрим ответы",
            [[{ text: "Смотреть", callback_data: `showSceneAnswers:${room}:${scene}` }]]
          );
        } catch (error) {
          console.log(error.message || error);
        }
      }, timeoutAlert);
    }, 1000 * 60 * timer - timeoutAlert);
  }

  removeTimeout(room) {
    if (this.activeTimers[room]) clearTimeout(this.activeTimers[room]);
  }
}

export default new Timeout();
