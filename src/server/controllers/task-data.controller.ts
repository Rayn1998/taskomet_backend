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

export async function addDailies(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const data = JSON.parse(req.body.data);
    const newName = randomBytes(4).toString("hex");
    const fullPath = join(req.file!.destination, newName + ".mp4");
    const relativePath = fullPath.split("/").slice(-3).join("/");
    ffmpeg(req.file!.path)
        .outputOptions(["-c:v libx264", "-c:a aac", "-movflags +faststart"])
        .save(fullPath)
        .on("end", async () => {
            await fs.rm(req.file!.path);
            data.media = relativePath;
            const newData = await taskDataService.addDailies(data as ITaskData);
            if (newData) res.json(newData);
        })
        .on("error", (err) => {
            console.error("Ошибка при конвертации:", err);
            res.send("Ошибка");
        });
}
