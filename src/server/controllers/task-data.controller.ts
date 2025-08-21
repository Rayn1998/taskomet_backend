import { NextFunction, Request, Response } from "express";
import * as taskDataService from "@/server/services/task-data.service";

export async function getTaskData(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { taskId } = req.body;

    try {
        const taskData = await taskDataService.getTaskData(taskId);
        res.json(taskData);
    } catch (err) {
        next(err);
    }
}
