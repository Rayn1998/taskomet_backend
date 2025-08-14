import { dataBasePool } from '../../app';

export async function getAll() {
    return (await dataBasePool.query('SELECT * FROM projects')).rows;
}
