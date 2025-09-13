import { Router } from "express";

import {
    getTaskData,
    addDailies,
} from "@/server/controllers/task-data.controller";
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
router.post("/task-dailies", multerInstance.single("file"), addDailies);

export default router;
