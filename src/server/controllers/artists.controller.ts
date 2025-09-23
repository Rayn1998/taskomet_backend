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
    const { user_name } = req.params ?? {};
    if (!user_name)
        return next(new Error("No necessary data provided: user_name"));

    try {
        const artist = await artistService.getArtist(user_name);
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
    const { name, user_name, role, photo_url }: Omit<IArtist, "id"> =
        req.body ?? {};
    if (!(name && user_name && role && photo_url))
        return next(
            new Error(
                "Necessary data not provided: name or user_name or role or photo_url",
            ),
        );

    try {
        const newArtist: IArtist = await artistService.createArtist({
            name,
            user_name,
            role,
            photo_url,
        });
        res.json(newArtist);
    } catch (err) {
        next(err);
    }
}
