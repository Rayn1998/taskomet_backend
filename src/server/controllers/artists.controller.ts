import { Request, Response, NextFunction } from "express";
import * as artistService from "@/server/services/artists.service";

export async function getArtists(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const artist = await artistService.getAll();
        res.json(artist);
    } catch (err) {
        next(err);
    }
}

export async function createArtist(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { name, role, tgid } = req.body;
        const newArtist = await artistService.createArtist(name, role, tgid);
        res.json(newArtist);
    } catch (err) {
        next(err);
    }
}
