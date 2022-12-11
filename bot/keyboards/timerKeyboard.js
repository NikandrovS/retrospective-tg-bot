import { Markup } from "telegraf";

export default Markup.inlineKeyboard([
  [Markup.button.callback("🕒 3 минуты", "timer:3"), Markup.button.callback("🕕 6 минут", "timer:6")],
  [Markup.button.callback("🕘 9 минут", "timer:9"), Markup.button.callback("🕛 12 минут", "timer:12")],
  [Markup.button.callback("« Назад", "initScene")],
]);
