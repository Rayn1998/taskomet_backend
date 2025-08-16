import { NextFunction, Request, Response } from "express";
import * as tasksService from "@/server/services/tasks.service";
import { ApiError } from "../error/ApiError";

export async function getTasks(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { projectId, sceneId } = req.params;

    try {
        const tasks = await tasksService.getAll(projectId, sceneId);
        if (!tasks || tasks.length === 0) {
            throw ApiError.notFound("tasks not found");
        }
        res.json(tasks);
    } catch (err) {
        next(err);
    }
}
