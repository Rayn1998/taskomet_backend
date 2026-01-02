import dataBasePool from "@/db/db";

export async function addSession(
    session: string,
    userId: number,
    expiration: Date,
) {
    return (
        await dataBasePool.query(
            `
        INSERT INTO sessions (id, user_id, expires_at) 
        VALUES ($1, $2, $3)
        RETURNING *;
    `,
            [session, userId, expiration],
        )
    ).rows[0];
}
