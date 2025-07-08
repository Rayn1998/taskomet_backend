import TelegramBot from "node-telegram-bot-api";
import { Pool } from "pg";
import { botKey, dbData } from "./constant";
import Bot from "./bot/bot.service";

const telegramBot = new TelegramBot(botKey, {polling: true});
const dataBasePool = new Pool(dbData);

const mmproBot = new Bot(telegramBot, dataBasePool);

export default mmproBot;