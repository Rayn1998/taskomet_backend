import Bot from '../bot.service';
import { Message } from 'node-telegram-bot-api';

export const commandHandlers = new Map<string, (bot: Bot, msg: Message) => Promise<void>>();

commandHandlers.set('/start', async (bot, msg) => {
    await bot.sendMessage(msg.chat.id, 'bot started');
});

commandHandlers.set('/addartist', async (bot, msg) => {
    await bot.artist.addNewArtist(bot, msg);
});

commandHandlers.set('/testgoogle', async (bot, msg) => {
    const data = await bot.google.getHOLtasks();
    console.log(data?.data.values);
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
    // console.log(data?.data.values);
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
    // for test
    {
        command: 'testgoogle',
        description: 'testgoogle',
    },
    // for test
    {
        command: 'getprojects',
        description: 'getprojects',
    },
];
