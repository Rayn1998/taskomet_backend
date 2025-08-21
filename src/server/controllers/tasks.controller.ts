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
