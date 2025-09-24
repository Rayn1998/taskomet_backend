import "dotenv/config";

// import TelegramBot from "node-telegram-bot-api";
// import { botKey } from "@/constant";
// import Bot from "@/bot/bot.service";
// import Google from "@/google/google.service";
// import Artist from "@/artist/artist.service";
import dataBasePool from "@/db/db";

import Server from "@/server/index";

// const telegramBot = new TelegramBot(botKey, { polling: true });
// const google = new Google();
// const artist = new Artist();

// const mmproBot = new Bot(telegramBot, dataBasePool, artist);

const server = new Server(dataBasePool, +process.env.SERVER_PORT!);

// export { mmproBot, server };
export { server };
