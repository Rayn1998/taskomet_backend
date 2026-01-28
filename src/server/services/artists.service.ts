import dataBasePool from "@/db/db";
import IArtist from "@shared/types/Artist";
import { ApiError } from "../error/ApiError";

type GetArtistParams =
    | { id: number }
    | { email: string }
    | { user_name: string };

export async function getAll(): Promise<IArtist[]> {
    return (
        await dataBasePool.query(
            `SELECT id, name, user_name, email, tg_id, role, photo_url FROM artist ORDER BY name;`,
        )
    ).rows;
}

export async function getArtist(
    params: GetArtistParams,
): Promise<IArtist | undefined> {
    if ("email" in params) {
        return (
            await dataBasePool.query("SELECT * FROM artist WHERE email = $1;", [
                params.email,
            ])
        ).rows[0];
    }

    if ("user_name" in params) {
        return (
            await dataBasePool.query(
                "SELECT * FROM artist WHERE user_name = $1;",
                [params.user_name],
            )
        ).rows[0];
    }

    if ("id" in params) {
        return (
            await dataBasePool.query("SELECT * FROM artist WHERE id = $1;", [
                params.id,
            ])
        ).rows[0];
    }
}

export async function createArtist(
    props: Omit<IArtist, "id" | "role" | "photo_url">,
): Promise<IArtist> {
    const { name, user_name, email, password, tg_id } = props;

    const role = 1;

    try {
        const newArtist: IArtist = (
            await dataBasePool.query(
                `
            INSERT INTO artist (name, user_name, email, password, role, tg_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `,
                [name, user_name, email, password, role, tg_id],
            )
        ).rows[0];

        return newArtist;
    } catch (err: any) {
        if (err.code === "23505") {
            if (err.constraint === "artist_user_name_key") {
                throw ApiError.conflict(
                    "User with this userName already exists",
                );
            }
            if (err.constraint === "artist_email_key") {
                throw ApiError.conflict("User with this email already exists");
            }

            throw ApiError.conflict("Artist already exists");
        }

        throw err;
    }
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
