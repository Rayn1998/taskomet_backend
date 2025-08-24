import { NextFunction, Request, Response } from "express";
import * as tasksService from "@/server/services/tasks.service";

export async function getTasks(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { projectId, sceneId } = req.params;

    try {
        const tasks = await tasksService.getAll(projectId, sceneId);
        res.json(tasks);
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
    const { taskId, status } = req.body;
    try {
        const update = await tasksService.updateStatus(taskId, status);
        if (update) res.json(status);
    } catch (err) {
        next(err);
    }
}
