import * as fs from "fs/promises";
import { NextFunction, Request, Response } from "express";
import * as projectService from "@/server/services/projects.service";
import dataBasePool from "@/db/db";

import ITaskData from "@shared/types/TaskData";

export async function getProjects(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        await dataBasePool.query("BEGIN");

        const projects = await projectService.getAll();
        const progressArr = [];
        for (const project of projects) {
            const progress = await projectService.getProjectsProgress(
                project.id,
            );

            const idsOfTasks = (
                await dataBasePool.query(
                    "SELECT array_agg(id) FROM tasks WHERE project = $1;",
                    [project.id],
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
                WHERE project = $1;
            `,
                    [project.id],
                )
            ).rows[0].count;

            const resData = {
                entityId: project.id,
                progress: progress,
                spentHours: Number(spentHours),
                executorsCount: Number(executorsCount),
            };
            progressArr.push(resData);
        }

        await dataBasePool.query("COMMIT");
        res.json([projects, progressArr]);
    } catch (err) {
        await dataBasePool.query("ROLLBACK");
        next(err);
    }
}

export async function createProject(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { name, description } = req.body ?? {};
    if (!name) return next(new Error("Name is not provided: name"));

    try {
        const newProject = await projectService.createProject(
            name,
            description,
        );
        res.json(newProject);
    } catch (err) {
        next(err);
    }
}

export async function deleteProject(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { projectId } = req.params ?? {};
    if (!projectId)
        return next(new Error("Project id not provided: projectId"));

    try {
        await dataBasePool.query("BEGIN");

        const sceneIds = (
            await dataBasePool.query(
                `SELECT * FROM scenes WHERE project = $1;`,
                [projectId],
            )
        ).rows.map((scene) => scene.id);

        const taskIds = (
            await dataBasePool.query(
                `SELECT * FROM tasks WHERE scene = ANY($1::int[]);`,
                [sceneIds],
            )
        ).rows.map((task) => task.id);

        const taskData: ITaskData[] = (
            await dataBasePool.query(
                `SELECT * FROM task_data WHERE task_id = ANY($1::int[]);`,
                [taskIds],
            )
        ).rows;

        for (const data of taskData) {
            if (data.media) await fs.rm(data.media);
        }

        await projectService.deleteProject(Number(projectId));
        await dataBasePool.query("COMMIT");
        res.sendStatus(204);
    } catch (err) {
        await dataBasePool.query("ROLLBACK");
        next(err);
    }
}
