import * as fs from "fs/promises";
import { NextFunction, Request, Response } from "express";

import * as taskDataService from "@/server/services/task-data.service";
import { saveMedia } from "@/server/utils/saveMedia";

// TYPES
import type { ITaskData } from "@shared/types/EntityData";

export async function getTaskData(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { id } = req.query ?? {};
    if (!id) return next(new Error("No necessary data provided: id"));

    try {
        const taskData = await taskDataService.getTaskData(Number(id));
        res.json(taskData);
    } catch (err) {
        next(err);
    }
}

export async function addComment(
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
            const newData = await taskDataService.addComment(data as ITaskData);
            if (newData) res.json(newData);
        },
        () => {
            next(new Error("Ошибка добавления комментария"));
        },
    );
}

export async function deleteComment(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { id } = req.params ?? {};
    if (!id) return next(new Error("No necessary data provided: id"));

    try {
        const deleted = await taskDataService.deleteComment(+id);
        if (deleted.media && deleted.media !== null) {
            fs.rm(deleted.media);
        }
        if (deleted) res.status(200).json({ ok: true });
    } catch (err) {
        next(err);
    }
}
