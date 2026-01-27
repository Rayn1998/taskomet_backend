import { randomBytes, createHash } from "crypto";
import * as sessionService from "@/server/services/session.service";
import * as Time from "@/server/utils/time";

import ISession from "@shared/types/Session";

export const createSession = async (userId: number): Promise<string> => {
    const session = randomBytes(32).toString("hex");
    const sessionHash = createHash("sha256").update(session).digest("hex");
    const expires_at = Time.nowPlus7Days();
    try {
        await sessionService.addSession(sessionHash, userId, expires_at);
        return session;
    } catch (err) {
        throw new Error("Error creating new session");
    }
};

export const checkSession = async (
    cookie: string,
): Promise<ISession | undefined> => {
    const sessionHash = createHash("sha256").update(cookie).digest("hex");
    try {
        const existedSession = await sessionService.getSession(sessionHash);
        if (existedSession!) return existedSession;
    } catch (err) {
        throw new Error("Unauthorized");
    }
};

export const checkIfSessionExists = async (
    userId: number,
): Promise<ISession> => {
    return await sessionService.checkSessionByUserId(userId);
};

export const deleteSession = async (sessionHash: string): Promise<boolean> => {
    const deletedSession = await sessionService.deleteSession(sessionHash);
    return deletedSession !== undefined ? true : false;
};
