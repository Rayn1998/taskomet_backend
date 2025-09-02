import { NextFunction, Request, Response } from "express";
import * as projectService from "@/server/services/projects.service";

export async function getProjects(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const projects = await projectService.getAll();
        res.json(projects);
    } catch (err) {
        next(err);
    }
}

export async function createProject(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { name, description } = req.body;
        const newProject = await projectService.createProject(
            name,
            description,
        );
        res.json(newProject);
    } catch (err) {
        next(err);
    }
}
