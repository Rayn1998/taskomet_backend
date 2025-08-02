import { Pool } from 'pg';
import { readFile } from 'fs/promises';

const dbData = {
    user: 'postgres',
    host: 'localhost',
    database: 'mmpro_tasks',
    password: 'postgresql',
    port: 5432,
};

const client = await new Pool(dbData).connect();
const artistData = JSON.parse(await readFile('artist_202507101254.json')).artist;

for (const artist of artistData) {
    await client.query('INSERT INTO artist(name, role, tgid) VALUES ($1, $2, $3)', [
        artist.name,
        artist.role,
        artist.tgid,
    ]);
}

console.log('SUCCESS');
process.exit(0);
