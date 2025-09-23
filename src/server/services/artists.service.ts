import dataBasePool from "@/db/db";
import IArtist from "@shared/types/Artist";

export async function getAll(): Promise<IArtist[]> {
    return (await dataBasePool.query(`SELECT * FROM artist`)).rows;
}

export async function getArtist(tg_id: number): Promise<IArtist | undefined> {
    return (
        await dataBasePool.query("SELECT * FROM artist WHERE tg_id = $1;", [
            tg_id,
        ])
    ).rows[0];
}

export async function createArtist(
    props: Omit<IArtist, "id">,
): Promise<IArtist> {
    const { name, user_name, role, photo_url, tg_id } = props;

    return (
        await dataBasePool.query(
            `
            INSERT INTO artist (name, user_name, role, photo_url, tg_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `,
            [name, user_name, role, photo_url, tg_id],
        )
    ).rows[0];
}
