import * as fs from "fs/promises";
import { NextFunction, Request, Response } from "express";
import * as tasksService from "@/server/services/tasks.service";
import * as taskDataService from "@/server/services/task-data.service";
import dataBasePool from "@/db/db";

// TYPES
import { TaskDataMin } from "@shared/types/TaskData";

export async function getTasks(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { projectId, sceneId } = req.params;

    try {
        const tasks = await tasksService.getTasks(projectId, sceneId);
        res.json(tasks);
    } catch (err) {
        next(err);
    }
}

export async function createTask(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { projectName, sceneName } = req.params;
    const { name, description } = req.body;

    try {
        await dataBasePool.query("BEGIN");

        const projectId: number = (
            await dataBasePool.query(
                `SELECT * FROM projects WHERE LOWER(name) = '${projectName}'`,
            )
        ).rows[0].id;
        const sceneId = (
            await dataBasePool.query(
                `SELECT * FROM scenes WHERE LOWER(name) = '${sceneName}'`,
            )
        ).rows[0].id;

        const newTask = await tasksService.createTask(
            name,
            description,
            projectId,
            sceneId,
        );
        dataBasePool.query("COMMIT");
        res.json(newTask);
    } catch (err) {
        dataBasePool.query("ROLLBACK");
        next(err);
    }
}

export async function deleteTask(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { id } = req.body;

    try {
        const taskData = await taskDataService.getTaskData(id);
        for (const data of taskData) {
            if (data.media) fs.rm(data.media);
        }
        const deleted = await tasksService.deleteTask(id);
        res.json(deleted);
    } catch (err) {
        next(err);
    }
}

export async function updateTaskExecutor(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { taskId, executorId } = req.body;
    try {
        const update = await tasksService.updateExecutor(taskId, executorId);
        if (update) res.json(executorId);
    } catch (err) {
        next(err);
    }
}

export async function updateTaskStatus(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { taskData }: { taskData: TaskDataMin } = req.body;
    try {
        const update = await tasksService.updateStatus(
            taskData.task_id,
            taskData.status,
        );
        const updateStatusTaskData = await taskDataService.addUpdateStatus(
            taskData,
        );
        if (update && updateStatusTaskData) res.json(updateStatusTaskData);
    } catch (err) {
        next(err);
    }
}

export async function updateTaskPriority(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { taskId, priority } = req.body;
    try {
        const update = await tasksService.updatePriority(taskId, priority);
        if (update) res.json(priority);
    } catch (err) {
        next(err);
    }
}

export async function getMyTasks(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { executorId } = req.params;
    try {
        const tasks = await tasksService.getMyTasks(Number(executorId));
        res.json(tasks);
    } catch (err) {
        next(err);
    }
}
