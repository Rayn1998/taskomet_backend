import { Request, Response } from "express";

export function checkServerConnection(req: Request, res: Response) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ok: true });
}
