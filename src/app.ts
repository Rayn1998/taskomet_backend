import TelegramBot from 'node-telegram-bot-api';
import { Pool } from 'pg';
import { botKey, dbData } from './constant';
import Bot from './bot/bot.service';
import Google from './google/google.service';
import Artist from './artist/artist.service';

import Server from './server/index';

const telegramBot = new TelegramBot(botKey, { polling: true });
const dataBasePool = new Pool(dbData);
const google = new Google();
const artist = new Artist();

const mmproBot = new Bot(telegramBot, dataBasePool, google, artist);

const server = new Server(dataBasePool);

export { mmproBot, server, dataBasePool };
