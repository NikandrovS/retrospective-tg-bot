import recieveText from "./scenes/recieveText.js";
import { Telegraf, session } from "telegraf";
import config from "../src/config/index.js";
import stage from "./scenes/index.js";

const bot = new Telegraf(config.botToken);
bot.use(session(), stage.middleware());

bot.command("/start", (ctx) => ctx.reply("welcome"));
bot.command("/create", (ctx) => ctx.scene.enter("roomCreate"));
bot.command("/leave", (ctx) => ctx.scene.enter("roomLeave"));
bot.command("/join", (ctx) => ctx.scene.enter("roomJoin"));
bot.command("/room", (ctx) => ctx.scene.enter("roomInfo"));

bot.action(/^showSceneAnswers:.*/, (ctx) => ctx.scene.enter("showSceneAnswers"));

bot.drop(recieveText);

export default bot.launch();
