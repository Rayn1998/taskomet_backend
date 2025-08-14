import { Request, Response } from 'express';
import * as scenesService from '../services/scenes.service';

export async function getScenes(req: Request, res: Response) {
    const { projectId } = req.params;
    const scenes = await scenesService.getAll(projectId);
    res.json(scenes);
}
