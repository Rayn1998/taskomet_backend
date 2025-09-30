import { Router } from "express";
import {
    getProjects,
    createProject,
    deleteProject,
} from "@/server/controllers/projects.controller";
import {
    getScenes,
    createScene,
    deleteScene,
} from "@/server/controllers/scenes.controller";
import {
    getTasks,
    getAllTasks,
    createTask,
} from "@/server/controllers/tasks.controller";

const router = Router();

router.get("/", getProjects);
router.post("/create-project", createProject);
router.get("/:projectId", getScenes);
router.delete("/:projectId", deleteProject);
router.post("/:projectName", createScene);
router.get("/get-all-tasks/:projectId", getAllTasks);
router.get("/:projectId/:sceneId", getTasks);
router.delete("/:projectId/:sceneId", deleteScene);
router.post("/:projectName/:sceneName", createTask);

export default router;
