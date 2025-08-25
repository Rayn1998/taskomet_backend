import dataBasePool from "@/db/db";

export async function getAll() {
    const result = await dataBasePool.query(`SELECT * FROM artist`);
    return result.rows;
}

export async function createArtist(name: string, role: number, tgid: string) {
    const result = await dataBasePool.query(
        `
            INSERT INTO artist (name, ROLE,tgid) 
            VALUES ($1, $2, $3)
            RETURNING *;
        `,
        [name, role, tgid],
    );
    return result.rows;
}
