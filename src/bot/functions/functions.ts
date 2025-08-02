import Bot from '../bot.service';
import { Message } from 'node-telegram-bot-api';
import { IArtist } from '../../types/IArtist';

export async function getTasks(bot: Bot, msg: Message) {
    try {
        const googleData = await bot.google.getHOLtasks();
        const artists: IArtist[] = (await bot.db.query('SELECT * FROM artist')).rows;

        for (const artist of artists) {
            const artistTasks: string[] = [];

            googleData?.data.values?.forEach(async (el) => {
                if (artist.name.toLowerCase() !== el[3].toLowerCase()) {
                    // идёт проверка по имени. В таблицах имя должно соответствовать и быть бех ошибок
                    return;
                }

                artistTasks.push(`${el[0]} ➡️ ${el[1]} - ${el[2]}`);
            });

            if (artistTasks.length !== 0) {
                const tasksString = artistTasks.join('\n');
                const message =
                    `${artist.tgid}\nХэй, привет, ${artist.name}, на тебе сегодня следующие задачки) :\n\n`.concat(
                        tasksString
                    );
                await bot.sendMessage(msg.chat.id, message);
            }
        }
    } catch (err) {
        console.error(err);
    }
}
