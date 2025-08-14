import { Request, Response } from 'express';
import * as tasksService from '../services/tasks.service';

export async function getTasks(req: Request, res: Response) {
    const { projectId, sceneId } = req.params;
    const tasks = await tasksService.getAll(projectId, sceneId);
    res.json(tasks);
}
