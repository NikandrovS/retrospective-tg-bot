import { Markup } from "telegraf";

export default (members, isOwner, isInProgress) => {
  const membersArr = members
    .sort((a, b) => a - b)
    .map((m) => (m === "username" ? Markup.button.callback("👤 User", "_") : Markup.button.url("👤 " + m, "https://t.me/" + m)));

  const chunkSize = 2;
  const formedArray = [];

  for (let i = 0; i < membersArr.length; i += chunkSize) {
    const chunk = membersArr.slice(i, i + chunkSize);

    formedArray.push(chunk);
  }

  if (isOwner) {
    if (isInProgress) formedArray.push([Markup.button.callback("Остановка сцены 🙅🏻‍♂️", "stopScene")]);
    else formedArray.push([Markup.button.callback("Запуск сцены 🚩", "initScene")]);
  }
  if (isOwner) formedArray.push([Markup.button.callback("Завершить ретро 🏁", "finishEvent")]);

  formedArray.push([Markup.button.callback("Покинуть комнату " + (isOwner ? "🏴‍☠️" : "🏳️"), "leave")]);
  formedArray.push([Markup.button.callback("Отмена", "cancel")]);

  return Markup.inlineKeyboard(formedArray);
};
