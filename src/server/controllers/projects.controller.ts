import { Request, Response } from 'express';
import * as projectService from '@/server/services/projects.service';

export async function getProjects(req: Request, res: Response) {
    const projects = await projectService.getAll();
    res.json(projects);
}
