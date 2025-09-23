import dataBasePool from "@/db/db";
import IArtist from "@shared/types/Artist";

export async function getAll(): Promise<IArtist[]> {
    return (await dataBasePool.query(`SELECT * FROM artist`)).rows;
}

export async function getArtist(
    user_name: string,
): Promise<IArtist | undefined> {
    return (
        await dataBasePool.query("SELECT * FROM artist WHERE user_name = $1;", [
            user_name,
        ])
    ).rows[0];
}

export async function createArtist(
    props: Omit<IArtist, "id">,
): Promise<IArtist> {
    const { name, user_name, role, photo_url } = props;
    return (
        await dataBasePool.query(
            `
            INSERT INTO artist (name, user_name, role, photo_url)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `,
            [name, user_name, role, photo_url],
        )
    ).rows[0];
}
