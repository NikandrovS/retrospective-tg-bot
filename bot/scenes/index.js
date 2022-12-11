import { Scenes } from "telegraf";

import roomConclusion from "./roomConclusion.js";
import sceneAnswers from "./sceneAnswers.js";
import roomCreate from "./roomCreate.js";
import roomLeave from "./roomLeave.js";
import roomJoin from "./roomJoin.js";
import roomInfo from "./roomInfo.js";

export default new Scenes.Stage([roomCreate, roomLeave, roomJoin, roomInfo, sceneAnswers, roomConclusion]);
