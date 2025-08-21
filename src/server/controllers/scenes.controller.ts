import { NextFunction, Request, Response } from "express";
import * as scenesService from "@/server/services/scenes.service";

export async function getScenes(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { projectId } = req.params;
    try {
        const scenes = await scenesService.getAll(projectId);
        res.json(scenes);
    } catch (err) {
        next(err);
    }
}
