import TelegramBot from 'node-telegram-bot-api';
import { Pool } from 'pg';
import Google from '../google/google.service';

export default class Bot {
    bot: TelegramBot;
    db: Pool;
    google: Google;

    constructor(
        botInstance: TelegramBot,
        dbInstance: Pool,
        googleInstance: Google
    ) {
        this.bot = botInstance;
        this.db = dbInstance;
        this.google = googleInstance;
    }

    async init() {
        const dbConnection = await this.connectToDb();
        const settingCommands = await this.setCommands();
        if (!dbConnection || !settingCommands) {
            console.error("Something doesn't work, check");
            process.exit(1);
        }
        console.log('Bot started to work');
        await this.listen();
    }

    async connectToDb(): Promise<boolean> {
        try {
            const connection = await this.db.connect();
            if (connection) {
                console.log('DataBase connection established');
            }
            return true;
        } catch (err) {
            console.log("Can't connect to db");
            return false;
        }
    }

    async setCommands(): Promise<boolean> {
        try {
            await this.bot.setMyCommands(
                [
                    {
                        command: 'start',
                        description: 'Приветствие бота',
                    },
                    {
                        command: 'getmetadata',
                        description: 'get the metadata',
                    },
                ],
                {
                    scope: {
                        type: 'all_group_chats',
                    },
                }
            );
            return true;
        } catch (err) {
            console.error('Ошибка при установке команд: ', err);
            return false;
        }
    }

    async listen() {
        this.bot.onText(/\/start/, async (msg) => {
            await this.bot.sendMessage(msg.chat.id, 'bot started');
        });
        this.bot.onText(/\/getmetadata/, async (msg) => {
            await this.google.getMetaData();
            // await this.bot.sendMessage(msg.chat.id, `${metaData}`);
        });
    }
}
