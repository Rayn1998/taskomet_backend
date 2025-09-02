import { NextFunction, Request, Response } from "express";
import * as scenesService from "@/server/services/scenes.service";
import dataBasePool from "@/db/db";

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

export async function createScene(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { name, description } = req.body;
    const { projectName } = req.params;

    try {
        await dataBasePool.query("BEGIN");

        const projectId: number = (
            await dataBasePool.query(
                `SELECT * FROM projects WHERE LOWER(name) = '${projectName}'`,
            )
        ).rows[0].id;

        const newScene = await scenesService.createScene(
            name,
            projectId,
            description,
        );

        await dataBasePool.query("COMMIT");
        res.json(newScene);
    } catch (err) {
        await dataBasePool.query("ROLLBACK");
        next(err);
    }
}
