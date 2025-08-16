import { NextFunction, Request, Response } from "express";
import * as scenesService from "@/server/services/scenes.service";
import { ApiError } from "../error/ApiError";

export async function getScenes(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { projectId } = req.params;
    try {
        const scenes = await scenesService.getAll(projectId);
        if (!scenes || scenes.length === 0) {
            throw ApiError.notFound("scenes not found");
        }
        res.json(scenes);
    } catch (err) {
        next(err);
    }
}
