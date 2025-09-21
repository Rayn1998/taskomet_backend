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
        const projects = await projectService.getAll();
        res.json(projects);
    } catch (err) {
        next(err);
    }
}

export async function createProject(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { name, description } = req.body;

        if (!name) throw new Error("Name is not provided");

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
    try {
        const { projectId } = req.params;

        if (!projectId) throw new Error("Project id not provided");

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
