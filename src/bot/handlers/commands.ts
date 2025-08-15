import Bot from '@/bot/bot.service';
import { Message } from 'node-telegram-bot-api';

import { getTasks } from '@/bot/functions/functions';

export const commandHandlers = new Map<string, (bot: Bot, msg: Message) => Promise<void>>();

commandHandlers.set('/start', async (bot, msg) => {
    await bot.sendMessage(msg.chat.id, 'bot started');
});

commandHandlers.set('/addartist', async (bot, msg) => {
    await bot.artist.addNewArtist(bot, msg);
});

commandHandlers.set('/gettasks', async (bot, msg) => {
    await getTasks(bot, msg);
});

commandHandlers.set('/getprojects', async (bot, msg) => {
    const data = await bot.google.getProjects();
    for (const chunk of data?.data.values!) {
        await bot.sendMessage(
            msg.chat.id,
            `
            Project name: ${chunk[0]},\n
            Project description: ${chunk[1]}
            `
        );
    }
});

export const commands = [
    {
        command: 'start',
        description: 'Приветствие бота',
    },
    {
        command: 'addartist',
        description: 'Добавление нового артиста',
    },
    {
        command: 'gettasks',
        description: 'Получить список своих задач',
    },
    // for test
    {
        command: 'getprojects',
        description: 'getprojects',
    },
];
