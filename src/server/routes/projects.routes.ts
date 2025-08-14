import { Router } from 'express';
import { getProjects } from '../controllers/projects.controller';
import { getScenes } from '../controllers/scenes.controller';
import { getTasks } from '../controllers/tasks.controller';

const router = Router();

router.get('/', getProjects);
router.get('/:projectId', getScenes);
router.get('/:projectId/:sceneId', getTasks);

export default router;
