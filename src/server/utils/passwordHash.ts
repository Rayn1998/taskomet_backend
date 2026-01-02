import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

import { Request, Response, NextFunction } from "express";
import * as sessionController from "@/server/controllers/session.controller";

const asyncScrypt = promisify(scrypt);

export const hashPassword = async (password: string): Promise<string> => {
    const salt = randomBytes(16).toString("hex");
    const hash = (await asyncScrypt(password, salt, 64)) as Buffer;
    return `${salt}:${hash.toString("hex")}`;
};

export const verifyPassword = async (
    password: string,
    hash: string,
): Promise<boolean> => {
    const [salt, storedKey] = hash.split(":");
    const key = (await asyncScrypt(password, salt, 64)) as Buffer;
    return timingSafeEqual(Buffer.from(storedKey, "hex"), key);
};

export const checkAuth = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (!(req.headers.cookie && req.headers.cookie.startsWith("session")))
        return res.status(401).send("Unauthorized");
    const cookie = req.headers.cookie.split("=")[1];
    const session = await sessionController.checkSession(cookie);
    if (!session) return res.status(401).send("Unauthorized");
    if (new Date(session.expires_at).getTime() < Date.now())
        return res.status(401).send("Session expiresd");

    next();
};
