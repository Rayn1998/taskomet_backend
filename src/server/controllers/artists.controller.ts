import { Request, Response, NextFunction } from "express";
import * as artistService from "@/server/services/artists.service";

import IArtist from "@shared/types/Artist";

export async function getArtists(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const artist: IArtist[] = await artistService.getAll();
        res.json(artist);
    } catch (err) {
        next(err);
    }
}

export async function getArtist(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { tg_id } = req.params ?? {};
    if (!tg_id) return next(new Error("No necessary data provided: user_name"));

    try {
        const artist = await artistService.getArtist(Number(tg_id));
        if (artist === undefined) return res.json([]);
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
    const { name, user_name, role, photo_url, tg_id }: Omit<IArtist, "id"> =
        req.body ?? {};

    if (!(name && role && tg_id))
        return next(
            new Error("Necessary data not provided: name or role or tg_id"),
        );

    try {
        const newArtist: IArtist = await artistService.createArtist({
            name,
            user_name,
            role,
            photo_url,
            tg_id,
        });
        res.json(newArtist);
    } catch (err) {
        next(err);
    }
}
