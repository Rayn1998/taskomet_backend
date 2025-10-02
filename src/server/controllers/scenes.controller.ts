import * as fs from "fs/promises";
import { NextFunction, Request, Response } from "express";

import * as scenesService from "@/server/services/scenes.service";
import dataBasePool from "@/db/db";
import { saveMedia } from "@/server/utils/saveMedia";

import type { ITaskData, ISceneData } from "@shared/types/EntityData";

export async function getScenes(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { projectId } = req.params ?? {};
    if (!projectId)
        return next(new Error("No necessary data provided: projectId"));

    try {
        await dataBasePool.query("BEGIN");
        const scenes = await scenesService.getAll(projectId);
        const progressArr = [];
        for (const scene of scenes) {
            const progress = await scenesService.getScenesProgress(scene.id);
            const priority = await scenesService.getScenesPriority(scene.id);

            const idsOfTasks = (
                await dataBasePool.query(
                    "SELECT array_agg(id) FROM tasks WHERE scene = $1;",
                    [scene.id],
                )
            ).rows[0].array_agg;

            const spentHours = (
                await dataBasePool.query(
                    `
                    SELECT SUM(spent_hours) AS hours
                    FROM task_data 
                    WHERE task_id = ANY($1);
                    `,
                    [idsOfTasks],
                )
            ).rows[0].hours;

            const executorsCount = (
                await dataBasePool.query(
                    `
                SELECT COUNT(DISTINCT executor) 
                FROM tasks
                WHERE scene = $1;
            `,
                    [scene.id],
                )
            ).rows[0].count;

            const resData = {
                entityId: scene.id,
                progress,
                priority,
                spentHours: Number(spentHours),
                executorsCount: Number(executorsCount),
            };
            progressArr.push(resData);
        }

        await dataBasePool.query("COMMIT");
        res.json([scenes, progressArr]);
    } catch (err) {
        await dataBasePool.query("ROLLBACK");
        next(err);
    }
}

export async function getSceneData(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { id } = req.query ?? {};
    if (!id) return next(new Error("No necessary data provided: id"));

    try {
        const sceneData = await scenesService.getSceneData(Number(id));
        res.json(sceneData);
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

export async function addSceneMedia(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const data = JSON.parse(req.body.data);
    if (!data) return next(new Error("No necessary data provided"));

    await saveMedia(
        data,
        req.file,
        async () => {
            const newData = await scenesService.addMedia(data as ISceneData);
            if (newData) res.json(newData);
        },
        () => {
            next(new Error("Ошибка добавления комментария"));
        },
    );
}

export async function deleteSceneMedia(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { mediaId } = req.params ?? {};
    if (!mediaId) return next(new Error("No necessary data provided: mediaId"));

    try {
        const deleted = await scenesService.deleteSceneMedia(+mediaId);
        if (deleted.media && deleted.media !== null) {
            fs.rm(deleted.media);
        }
        if (deleted) res.sendStatus(200);
    } catch (err) {
        next(err);
    }
}
