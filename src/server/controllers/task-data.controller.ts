import { NextFunction, Request, Response } from "express";
import * as taskDataService from "@/server/services/task-data.service";
import { ApiError } from "../error/ApiError";

export async function getTaskData(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { taskId } = req.body;

    try {
        const taskData = await taskDataService.getTaskData(taskId);
        if (!taskData || taskData.length === 0) {
            throw ApiError.notFound("task data not found");
        }
        res.json(taskData);
    } catch (err) {
        next(err);
    }
}
