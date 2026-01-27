import { createHash } from "crypto";
import { Request, Response, NextFunction } from "express";
import { getArtist } from "@/server/services/artists.service";
import { verifyPassword } from "@/server/utils/passwordHash";
import * as sessionController from "@/server/controllers/session.controller";
import { getCookie } from "@/server/utils/getCookie";

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { email, userName, password: receivedPassword } = req.body;
    try {
        const user = await getArtist(email, userName);
        if (!user || !verifyPassword(receivedPassword, user.password))
            return res.status(401).json({ message: "Invalid credentials" });

        const session = await sessionController.createSession(user.id);
        const { password, ...userToClient } = user;
        res.cookie("session", session).status(200).send(userToClient);
    } catch (err) {
        next(err);
    }
};

export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const cookie = getCookie(req, "session");

    if (cookie) {
        const sessionHash = createHash("sha256").update(cookie).digest("hex");
        await sessionController.deleteSession(sessionHash);
    }
    res.cookie("session", "", {
        expires: new Date(0),
    })
        .status(200)
        .json({ message: "You are logged out" });
};

export const checkAuth = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (!(req.headers.cookie && req.headers.cookie.startsWith("session")))
        return res.status(401).json({ message: "Unauthorized" });
    const cookie = getCookie(req, "session");
    const session = await sessionController.checkSession(cookie!);
    if (!session) return res.status(401).json({ message: "Unauthorized" });
    if (new Date(session.expires_at).getTime() < Date.now())
        return res.status(401).json({ message: "Session expiresd" });

    next();
};
