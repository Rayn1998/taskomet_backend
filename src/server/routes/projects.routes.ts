import { Router } from "express";
import { multerInstance } from "@/server/utils/multer";
import {
    getProjects,
    getProjectData,
    createProject,
    deleteProject,
    addProjectMedia,
    deleteProjectMedia,
} from "@/server/controllers/projects.controller";
import {
    getScenes,
    createScene,
    deleteScene,
    getSceneData,
    addSceneMedia,
    deleteSceneMedia,
} from "@/server/controllers/scenes.controller";
import {
    getTasks,
    getAllTasks,
    createTask,
} from "@/server/controllers/tasks.controller";

const router = Router();

router.get("/", getProjects);
router.get("/project-data", getProjectData);
router.get("/scene-data", getSceneData);
router.get("/:projectId", getScenes);
router.get("/get-all-tasks/:projectId", getAllTasks);
router.get("/:projectId/:sceneId", getTasks);
router.post("/create-project", createProject);
router.post("/project-media", multerInstance.single("file"), addProjectMedia);
router.post("/scene-media", multerInstance.single("file"), addSceneMedia);
router.post("/:projectName", createScene);
router.post("/:projectName/:sceneName", createTask);
router.delete("/project-media/:mediaId", deleteProjectMedia);
router.delete("/scene-media/:mediaId", deleteSceneMedia);
router.delete("/:projectId", deleteProject);
router.delete("/:projectId/:sceneId", deleteScene);

export default router;
