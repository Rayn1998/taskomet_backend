import dataBasePool from "@/db/db";
import IArtist from "@shared/types/Artist";

export async function getAll(): Promise<IArtist[]> {
    return (await dataBasePool.query(`SELECT * FROM artist`)).rows;
}

export async function createArtist(
    name: string,
    role: number,
    tgid: string,
): Promise<IArtist> {
    return (
        await dataBasePool.query(
            `
            INSERT INTO artist (name, ROLE,tgid) 
            VALUES ($1, $2, $3)
            RETURNING *;
        `,
            [name, role, tgid],
        )
    ).rows[0];
}
