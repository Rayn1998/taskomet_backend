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

export const getSession = async (sessionHash: string): Promise<ISession> => {
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
): Promise<ISession> => {
    return (
        await dataBasePool.query(
            `
                SELECT * FROM sessions
                WHERE user_id = $1;
            `,
            [userId],
        )
    ).rows[0];
};

export const deleteSession = async (sessionHash: string): Promise<string> => {
    return (
        await dataBasePool.query(
            `
            DELETE FROM sessions
            WHERE id = $1
            RETURNING id;
        `,
            [sessionHash],
        )
    ).rows[0].id;
};
