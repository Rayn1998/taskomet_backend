import { createHash } from "crypto";
import { Request, Response, NextFunction } from "express";
import { getArtist } from "@/server/services/artists.service";
import { verifyPassword } from "@/server/utils/passwordHash";
import {
    createSession,
    checkIfSessionExists,
    deleteSession,
} from "@/server/controllers/session.controller";
import { getCookie } from "@/server/utils/getCookie";

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { email, userName, password } = req.body;
    try {
        const user = await getArtist(email, userName);
        if (!user) return res.status(4001).send("Invalid credentials");

        const loggedIn = await checkIfAlreadyLoggedIn(user.id);
        if (loggedIn) return res.status(200).send("You are already logged in");

        const checkAuth = await verifyPassword(password, user.password);
        if (checkAuth) {
            const session = await createSession(user.id);
            return res
                .cookie("session", session, {
                    httpOnly: true,
                    sameSite: "lax",
                    secure: process.env.NODE_ENV === "production",
                    path: "/",
                })
                .sendStatus(200);
        } else {
            throw new Error("Something in the provided data is incorrect");
        }
    } catch (err) {
        next(err);
    }
};

const checkIfAlreadyLoggedIn = async (userId: number): Promise<boolean> => {
    return await checkIfSessionExists(userId);
};

export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const session = getCookie(req, "session");

    if (!session) return res.sendStatus(204);
    const sessionHash = createHash("sha256").update(session).digest("hex");
    const loggedOut = await deleteSession(sessionHash);
    if (loggedOut) {
        res.clearCookie("session", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
        })
            .status(200)
            .send("You are logged out");
    } else {
        res.sendStatus(204);
    }
};
