import { Router } from "express";
import {
    getProjects,
    createProject,
} from "@/server/controllers/projects.controller";
import { getScenes, createScene } from "@/server/controllers/scenes.controller";
import { getTasks, createTask } from "@/server/controllers/tasks.controller";

const router = Router();

router.get("/", getProjects);
router.post("/create-project", createProject);
router.get("/:projectId", getScenes);
router.post("/:projectName", createScene);
router.get("/:projectId/:sceneId", getTasks);
router.post("/:projectName/:sceneName", createTask);

export default router;
