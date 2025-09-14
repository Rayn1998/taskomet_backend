import { randomBytes } from "crypto";
import { join } from "path";
import * as fs from "fs/promises";

import { NextFunction, Request, Response } from "express";
import ffmpeg from "fluent-ffmpeg";
import * as taskDataService from "@/server/services/task-data.service";

import ITaskData from "@shared/types/TaskData";

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

export async function addComment(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const data = JSON.parse(req.body.data);

    try {
        if (req.file) {
            const newName = randomBytes(4).toString("hex");
            const ext = req.file.originalname.split(".").slice(-1)[0];

            if (ext === "mp4" || ext === "mov") {
                const fullPath = join(req.file.destination, newName + ".mp4");
                const relativePath = fullPath.split("/").slice(-3).join("/");

                ffmpeg(req.file.path)
                    .outputOptions([
                        "-c:v libx264",
                        "-c:a aac",
                        "-movflags +faststart",
                    ])
                    .save(fullPath)
                    .on("end", async () => {
                        await fs.rm(req.file!.path);
                        data.media = relativePath;
                        const newData = await taskDataService.addComment(
                            data as ITaskData,
                        );
                        if (newData) res.json(newData);
                    })
                    .on("error", (err) => {
                        err.message = "Ошибка при конвертации";
                        next(err);
                    });
            } else {
                const fullPath = join(
                    req.file.destination,
                    newName + "." + ext,
                );
                const relativePath = fullPath.split("/").slice(-3).join("/");
                await fs.rename(req.file.path, fullPath);
                data.media = relativePath;
                const newData = await taskDataService.addComment(
                    data as ITaskData,
                );
                if (newData) res.json(newData);
            }
        } else {
            const newData = await taskDataService.addComment(data as ITaskData);
            if (newData) {
                res.json(newData);
            } else {
                next(new Error("Ошибка добавления комментария"));
            }
        }
    } catch (err) {}
}

export async function deleteComment(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { id } = req.params;

    try {
        const deleted = await taskDataService.deleteComment(+id);
        if (deleted.media !== null) {
            fs.rm(deleted.media);
        }
        if (deleted) res.sendStatus(200);
    } catch (err) {
        next(err);
    }
}
