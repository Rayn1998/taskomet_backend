import { NextFunction, Request, Response } from "express";
import * as projectService from "@/server/services/projects.service";
import { ApiError } from "../error/ApiError";

export async function getProjects(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const projects = await projectService.getAll();
        if (!projects || projects.length === 0) {
            throw ApiError.notFound("Project not found");
        }
        res.json(projects);
    } catch (err) {
        next(err);
    }
}
