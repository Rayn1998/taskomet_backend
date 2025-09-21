import { describe, it, expect, vi, afterEach } from "vitest";
import * as projectsController from "@/server/controllers/projects.controller";
import * as projectsService from "@/server/services/projects.service";

import IProject from "@shared/types/Project";

describe("projects controller", () => {
    const mockReq = {} as any;
    const mockRes = { json: vi.fn() } as any;
    const mockNext = vi.fn();

    afterEach(() => {
        vi.clearAllMocks();
        vi.resetAllMocks();
    });

    it("getProjects: должен вернуть список проектов", async () => {
        const fakeProjects: IProject[] = [
            {
                id: 1,
                name: "Eterna",
                status: 0,
                description: "fps 24",
                priority: 0,
            },
        ];

        vi.spyOn(projectsService, "getAll").mockResolvedValue(fakeProjects);

        await projectsController.getProjects(mockReq, mockRes, mockNext);

        expect(projectsService.getAll).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith(fakeProjects);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("getProjects: должен пробросить ошибку в next", async () => {
        const error = new Error("DB error");
        const mockReq = { body: {} } as any;
        vi.spyOn(projectsService, "getAll").mockRejectedValue(error);

        await projectsController.getProjects(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("createProject: success", async () => {
        const mockReq = {
            body: {
                name: "Project",
                description: "fps - 24",
            },
        } as any;

        const fakeProject = {
            id: 1,
            name: "Eterna",
            status: 0,
            description: "fps 24",
            priority: 0,
        };

        vi.spyOn(projectsService, "createProject").mockResolvedValue(
            fakeProject,
        );

        await projectsController.createProject(mockReq, mockRes, mockNext);

        expect(projectsService.createProject).toHaveBeenCalledWith(
            "Project",
            "fps - 24",
        );
        expect(mockRes.json).toHaveBeenCalledWith(fakeProject);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("createProject: empty body - error", async () => {
        const mockReq = {
            body: {},
        } as any;

        vi.spyOn(projectsService, "createProject");

        await projectsController.createProject(mockReq, mockRes, mockNext);

        expect(projectsService.createProject).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
    });

    it("deleteProject: success", async () => {
        const mockReq = { params: { projectId: 1 } } as any;
        const mockRes = { sendStatus: vi.fn() } as any;

        vi.spyOn(projectsService, "deleteProject");

        await projectsController.deleteProject(mockReq, mockRes, mockNext);

        expect(projectsService.deleteProject).toHaveBeenCalledWith(1);
        expect(mockRes.sendStatus).toHaveBeenCalled();
    });

    it("deleteProject: нет projectId - error", async () => {
        const mockReq = { params: { projectId: null } } as any;
        const mockRes = { sendStatus: vi.fn() } as any;

        vi.spyOn(projectsService, "deleteProject");

        await projectsController.deleteProject(mockReq, mockRes, mockNext);

        expect(projectsService.deleteProject).not.toHaveBeenCalled();
        expect(mockRes.sendStatus).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
    });
});
