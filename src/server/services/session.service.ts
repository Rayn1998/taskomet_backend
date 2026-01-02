import dataBasePool from "@/db/db";
import ISession from "@shared/types/Session";

export const addSession = async (
    sessionHash: string,
    userId: number,
    expiration: Date,
): Promise<ISession> => {
    return (
        await dataBasePool.query(
            `
        INSERT INTO sessions (id, user_id, expires_at) 
        VALUES ($1, $2, $3)
        RETURNING *;
    `,
            [sessionHash, userId, expiration],
        )
    ).rows[0];
};

export const checkSession = async (sessionHash: string): Promise<ISession> => {
    return (
        await dataBasePool.query(
            `
                SELECT * FROM sessions
                WHERE id = $1;
            `,
            [sessionHash],
        )
    ).rows[0];
};

export const checkSessionByUserId = async (
    userId: number,
): Promise<boolean> => {
    const count = (
        await dataBasePool.query(
            `
                SELECT * FROM sessions
                WHERE user_id = $1;
            `,
            [userId],
        )
    ).rowCount;
    return count && count > 0 ? true : false;
};

export const deleteSession = async (session: string): Promise<string> => {
    return (
        await dataBasePool.query(
            `
            DELETE FROM sessions
            WHERE id = $1
            RETURNING id;
        `,
            [session],
        )
    ).rows[0].id;
};
