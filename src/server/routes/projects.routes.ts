import { Router } from "express";
import { getProjects } from "@/server/controllers/projects.controller";
import { getScenes } from "@/server/controllers/scenes.controller";
import { getTasks, createTask } from "@/server/controllers/tasks.controller";

const router = Router();

router.get("/", getProjects);
router.get("/:projectId", getScenes);
router.get("/:projectId/:sceneId", getTasks);
router.post("/:projectName/:sceneName", createTask);

export default router;
