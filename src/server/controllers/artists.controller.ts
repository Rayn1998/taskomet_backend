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

    if (!(name && Number.isInteger(role) && user_name))
        return next(
            new Error("Necessary data not provided: name or role or user_name"),
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

export async function updateArtistRole(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { artistId, role } = req.body;

    if (!(artistId && Number.isInteger(role)))
        return next(new Error("Necessary data not provided: artistId or role"));

    try {
        const updatedArtist = await artistService.updateArtistRole(
            artistId,
            role,
        );
        res.json(updatedArtist);
    } catch (err) {
        next(err);
    }
}

export async function updateArtistAfterRegister(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { photo_url, tg_id, user_name } = req.body;
    if (!(tg_id && user_name))
        return next(
            new Error(
                "Necessary data not provided: photo_url, tg_id, user_name",
            ),
        );
    try {
        const updatedArtist = await artistService.updateArtistAfterRegister({
            photo_url,
            tg_id,
            user_name,
        });
        res.json(updatedArtist);
    } catch (err) {
        next(err);
    }
}
