import { Message, CallbackQuery } from 'node-telegram-bot-api';
import Bot from '../bot/bot.service';
import IArtist from './artist.interface';

export default class Artist {
    newArtistProcess: {
        [chatId: number]: { step: number; artist: Partial<IArtist> };
    };

    constructor() {
        this.newArtistProcess = {};
    }

    async addNewArtist(bot: Bot, msg: Message | CallbackQuery): Promise<void> {
        const { chatId, inputData } = bot.getChatIdAndInputData(msg);
        const process = this.newArtistProcess[chatId];

        if (await bot.checkInSomeProcess(msg)) {
            return;
        }

        if (process) {
            switch (process.step) {
                case 1:
                    process.artist.name = inputData;
                    process.step = 2;

                    await bot.sendMessage(chatId, 'супервайзер/артист', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Supervisor',
                                        callback_data: '1',
                                    },
                                    {
                                        text: 'Artist',
                                        callback_data: '2',
                                    },
                                ],
                            ],
                        },
                    });
                    break;

                case 2:
                    process.artist.role = Number(inputData);
                    process.step = 3;

                    await bot.sendMessage(chatId, 'Введите telegram id для уведомлений');
                    break;

                case 3:
                    process.artist.tgId = inputData;

                    try {
                        await bot.db.query(`INSERT INTO artist(name, role, tgid) VALUES ($1, $2, $3)`, [process.artist.name, process.artist.role, process.artist.tgId]);

                        await bot.sendMessage(chatId, 'Артист успешно добавлен');
                    } catch (err) {
                        await bot.sendMessage(chatId, 'Ошибка создания профиля артиста');
                        this.deleteStates(bot, chatId);
                        return;
                    }

                    this.deleteStates(bot, chatId);
                    break;

                default:
                    await bot.sendMessage(chatId, 'Произошла ошибка при добавлении артиста');
                    break;
            }
            return;
        }

        this.newArtistProcess[chatId] = { step: 1, artist: {} };
        bot.process = true;

        await bot.sendMessage(chatId, 'Введите имя артиста', {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Отмена',
                            callback_data: 'cancel',
                        },
                    ],
                ],
            },
        });
    }

    deleteStates(bot: Bot, chatId: number) {
        delete this.newArtistProcess[chatId];
        bot.process = false;
    }
}
