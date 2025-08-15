import dataBasePool from '@/db/db';

export async function getAll() {
    return (await dataBasePool.query('SELECT * FROM projects')).rows;
}
