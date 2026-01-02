import dataBasePool from "@/db/db";
import IArtist from "@shared/types/Artist";

export async function getAll(): Promise<IArtist[]> {
    return (await dataBasePool.query(`SELECT * FROM artist ORDER BY name;`))
        .rows;
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
    props: Omit<IArtist, "id" | "role" | "photo_url">,
): Promise<IArtist> {
    const {
        name,
        user_name,
        email,
        password,
        // photo_url,
        tg_id,
    } = props;

    const role = 1;
    return (
        await dataBasePool.query(
            `
            INSERT INTO artist (name, user_name, email, password, role, tg_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `,
            [name, user_name, email, password, role, tg_id],
        )
    ).rows[0];
}

export async function updateArtistRole(
    artistId: number,
    role: number,
): Promise<IArtist> {
    return (
        await dataBasePool.query(
            `
            UPDATE artist
            SET role = $1
            WHERE id = $2
            RETURNING *;
        `,
            [role, artistId],
        )
    ).rows[0];
}

export async function updateArtistAfterRegister(
    props: Omit<IArtist, "id" | "role" | "name">,
): Promise<IArtist> {
    const { photo_url, tg_id, user_name } = props;

    return (
        await dataBasePool.query(
            `
                UPDATE artist
                SET photo_url = $1, tg_id = $2
                WHERE user_name = $3
                RETURNING *;
            `,
            [photo_url, tg_id, user_name],
        )
    ).rows[0];
}

export async function deleteArtist(artistId: number): Promise<IArtist> {
    return (
        await dataBasePool.query(
            "DELETE FROM artist WHERE id = $1 RETURNING *;",
            [artistId],
        )
    ).rows[0];
}
