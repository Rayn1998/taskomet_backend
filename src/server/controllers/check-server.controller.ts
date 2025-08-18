import { Request, Response } from "express";

export function checkServerConnection(req: Request, res: Response) {
    return res.sendStatus(200);
}