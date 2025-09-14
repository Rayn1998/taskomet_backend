import * as fs from "fs/promises";
import { NextFunction, Request, Response } from "express";
import * as scenesService from "@/server/services/scenes.service";
import dataBasePool from "@/db/db";
import ITask from "@shared/types/Task";
import ITaskData from "@shared/types/TaskData";

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

export async function deleteScene(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { sceneId } = req.params;

        await dataBasePool.query("BEGIN");

        const tasks: ITask[] = (
            await dataBasePool.query(`SELECT * FROM tasks WHERE scene = $1;`, [
                sceneId,
            ])
        ).rows;

        const taskIds = tasks.map((task) => task.id);

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
