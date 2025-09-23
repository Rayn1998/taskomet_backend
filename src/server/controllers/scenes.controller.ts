import * as fs from "fs/promises";
import { NextFunction, Request, Response } from "express";
import * as scenesService from "@/server/services/scenes.service";
import dataBasePool from "@/db/db";
import ITaskData from "@shared/types/TaskData";

export async function getScenes(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { projectId } = req.params ?? {};
    if (!projectId)
        return next(new Error("No necessary data provided: projectId"));

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
    const { name, description } = req.body ?? {};
    const { projectName } = req.params ?? {};

    if (!name || !projectName)
        return next(
            new Error("No necessary data provided: projectName or name"),
        );

    try {
        await dataBasePool.query("BEGIN");

        const projectId: number = (
            await dataBasePool.query(
                `SELECT id FROM projects WHERE LOWER(name) = $1`,
                [projectName],
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

export async function deleteScene(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { sceneId } = req.params ?? {};
    if (!sceneId) return next(new Error("No necessary data provided: sceneId"));

    try {
        await dataBasePool.query("BEGIN");

        const tasksIds: { id: number }[] = (
            await dataBasePool.query(`SELECT id FROM tasks WHERE scene = $1;`, [
                sceneId,
            ])
        ).rows;

        const taskIds = tasksIds.map((task) => task.id);

        const taskData: ITaskData[] = (
            await dataBasePool.query(
                `SELECT * FROM task_data WHERE task_id = ANY($1::int[]);`,
                [taskIds],
            )
        ).rows;

        for (const data of taskData) {
            if (data.media) await fs.rm(data.media);
        }
        await scenesService.deleteScene(Number(sceneId));
        await dataBasePool.query("COMMIT");
        res.sendStatus(204);
    } catch (err) {
        await dataBasePool.query("ROLLBACK");
        next(err);
    }
}
