import { NextFunction, Request, Response } from 'express';
import * as projectService from '@/server/services/projects.service';
import { ApiError } from '../error/ApiError';

export async function getProjects(req: Request, res: Response, next: NextFunction) {
    try {
        const projects = await projectService.getAll();
        if (!projects) {
            throw new ApiError(404, 'Project not found');
        }
        res.json(projects);
        // throw new ApiError(500, 'projects are fucked up');
    } catch (err) {
        next(err);
    }
}
