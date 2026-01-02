import { Router } from "express";

import {
    getTaskData,
    addComment,
    deleteComment,
} from "@/server/controllers/task-data.controller";
import {
    updateTaskExecutor,
    updateTaskStatus,
    updateTaskPriority,
    deleteTask,
} from "@/server/controllers/tasks.controller";
import { multerInstance } from "@/server/utils/multerUtil";

const router = Router();

router.patch("/task-update-executor", updateTaskExecutor);
router.patch("/task-update-status", updateTaskStatus);
router.patch("/task-update-priority", updateTaskPriority);
router.delete("/delete-task", deleteTask);

router.get("/task-data", getTaskData);
router.post("/task-comment", multerInstance.single("file"), addComment);
router.delete("/task-comment/:id", deleteComment);

export default router;
