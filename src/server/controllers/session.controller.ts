import { randomBytes, createHash } from "crypto";
import * as sessionService from "@/server/services/session.service";
import * as Time from "@/server/utils/time";

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
