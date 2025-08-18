import { Router } from 'express';
import { getTaskData } from '../controllers/task-data.controller';

const router = Router();

router.get('/', getTaskData);

export default router;
