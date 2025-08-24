import { NextFunction, Request, Response } from "express";
import * as taskDataService from "@/server/services/task-data.service";

export async function getTaskData(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { id } = req.query;

    try {
        const taskData = await taskDataService.getTaskData(Number(id));
        res.json(taskData);
    } catch (err) {
        next(err);
    }
}
