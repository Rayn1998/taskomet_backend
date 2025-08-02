import TelegramBot, { Message, CallbackQuery, CopyMessageOptions } from 'node-telegram-bot-api';
import { Pool } from 'pg';
import Google from '../google/google.service';
import Artist from '../artist/artist.service';

import { isMessage, isCallbackQuery } from '../typeguards/typeguards';
import { commands, commandHandlers } from './handlers/commands';
import { botAddCommands, botCommands } from './bot.commands';

export default class Bot {
    bot: TelegramBot;
    db: Pool;
    artist: Artist;
    google: Google;
    process: boolean;

    constructor(
        botInstance: TelegramBot,
        dbInstance: Pool,
        googleInstance: Google,
        artistInstance: Artist
    ) {
        this.bot = botInstance;
        this.db = dbInstance;
        this.artist = artistInstance;
        this.google = googleInstance;
        this.process = false;
    }

    public async init() {
        try {
            const dbConnection = await this._connectToDb();
            const commandsStatus = await this._setCommands();
            const googleConnection = await this.google.init();

            if (!dbConnection || !commandsStatus || !googleConnection) {
                throw new Error("Something doesn't work, check");
            }

            console.log('Bot started to work');
            await this.listen();
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
            } else {
                console.error('An unknown error occurred');
            }
        }
    }

    private async _connectToDb(): Promise<boolean> {
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

    private async _setCommands(): Promise<boolean> {
        try {
            await this.bot.setMyCommands(commands);
            return true;
        } catch (err) {
            console.error('Ошибка при установке команд: ', err);
            return false;
        }
    }

    public getChatIdAndInputData(msg: Message | CallbackQuery): {
        chatId: number;
        inputData: string;
    } {
        let chatId = 0;
        let inputData = '';

        if (isMessage(msg)) {
            chatId = msg.chat.id;
            inputData = msg.text!;
        } else if (isCallbackQuery(msg)) {
            chatId = msg.message!.chat.id;
            inputData = msg.data!;
        }

        return { chatId, inputData };
    }

    private _checkCommands(text: string): boolean {
        if (botCommands.some((regex) => regex.test(text))) {
            return true;
        } else {
            return false;
        }
    }

    private _checkAddCommands(text: string): boolean {
        if (botAddCommands.some((regex) => regex.test(text))) {
            return true;
        } else {
            return false;
        }
    }

    public async sendMessage(chatId: number, message: string, options?: CopyMessageOptions) {
        try {
            await this.bot.sendMessage(chatId, message, options);
        } catch (err) {
            throw err;
        }
    }

    public async checkInSomeProcess(msg: Message | CallbackQuery): Promise<boolean> {
        const { chatId, inputData } = this.getChatIdAndInputData(msg);
        if (this.process && this._checkAddCommands(inputData)) {
            await this.sendMessage(
                chatId,
                'Вы начали, но не завершили процесс создания или добавления. Пожалуйста, завершите его или отмените',
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Отменить',
                                    callback_data: 'cancel',
                                },
                            ],
                        ],
                    },
                }
            );
            return true;
        }
        return false;
    }

    private async _cancelAllStarted(chatId: number) {
        this.artist.deleteStates(this, chatId);

        await this.sendMessage(chatId, 'Отмена');
    }

    public async listen() {
        this.bot.onText(/.*/, async (msg) => {
            const { chatId, inputData } = this.getChatIdAndInputData(msg);

            if (commandHandlers.has(inputData)) {
                await commandHandlers.get(inputData)!(this, msg);
            }
        });

        this.bot.on('message', async (msg) => {
            const { chatId, inputData } = this.getChatIdAndInputData(msg);

            if (this._checkAddCommands(inputData) || this._checkCommands(inputData)) {
                return;
            }

            if (this.process) {
                if (this.artist.newArtistProcess) {
                    await this.artist.addNewArtist(this, msg);
                    return;
                }
            }
        });

        this.bot.on('callback_query', async (query) => {
            const { chatId, inputData } = this.getChatIdAndInputData(query);

            if (!chatId || !inputData) return;

            if (inputData === 'cancel') {
                await this._cancelAllStarted(chatId);
                return;
            }

            if (this.process) {
                if (this.artist.newArtistProcess) {
                    await this.artist.addNewArtist(this, query);
                }
            }
        });
    }
}
