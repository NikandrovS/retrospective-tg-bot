import { Markup } from "telegraf";

export default (scenes) => {
  const arr = scenes.sort((a, b) => a.id - b.id).map((m) => Markup.button.callback(m.title, "sceneId:" + m.id));

  const chunkSize = 2;
  const formedArray = [];

  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);

    formedArray.push(chunk);
  }

  formedArray.push([Markup.button.callback("« Назад", "toRoom")]);

  return Markup.inlineKeyboard(formedArray);
};
