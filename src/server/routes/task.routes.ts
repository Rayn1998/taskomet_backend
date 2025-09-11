import { randomBytes } from "crypto";
import { join } from "path";
import * as fs from "fs/promises";

import { Router, Request, Response } from "express";
import ffmpeg from "fluent-ffmpeg";
import { getTaskData } from "@/server/controllers/task-data.controller";
import {
    updateTaskExecutor,
    updateTaskStatus,
    updateTaskPriority,
    deleteTask,
} from "@/server/controllers/tasks.controller";
import { multerInstance } from "@/server/utils/multer";

const router = Router();

router.patch("/task-update-executor", updateTaskExecutor);
router.patch("/task-update-status", updateTaskStatus);
router.patch("/task-update-priority", updateTaskPriority);
router.delete("/delete-task", deleteTask);

router.get("/task-data", getTaskData);
router.post(
    "/task-upload",
    multerInstance.single("data"),
    (req: Request, res: Response) => {
        const newName = randomBytes(4).toString("hex");
        const fullPath = join(req.file!.destination, newName + ".mp4");
        ffmpeg(req.file!.path)
            .outputOptions(["-c:v libx264", "-c:a aac"])
            .save(fullPath)
            .on("end", () => {
                console.log("Конвертация завершена");
                fs.rm(req.file!.path);
                res.send("Upload successfully");
            })
            .on("error", (err) => {
                console.error("Ошибка при конвертации:", err);
                res.send("Ошибка");
            });
    },
);

export default router;
