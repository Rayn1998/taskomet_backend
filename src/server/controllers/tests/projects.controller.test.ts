import { describe, it, expect, vi, afterEach } from "vitest";
import * as projectsController from "@/server/controllers/projects.controller";
import * as projectsService from "@/server/services/projects.service";
import dataBasePool from "@/db/db";

import IProject from "@shared/types/Project";

describe("projects controller", () => {
    const mockReq = {} as any;
    const mockRes = { json: vi.fn() } as any;
    const mockNext = vi.fn();

    afterEach(() => {
        vi.clearAllMocks();
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
        const mockReq = { params: { projectId: "1" } } as any;
        const mockRes = { sendStatus: vi.fn() } as any;

        vi.spyOn(projectsService, "deleteProject").mockResolvedValue({
            rowCount: 1,
        } as any);

        vi.spyOn(dataBasePool, "query").mockImplementation(
            async (sql, args) => {
                // console.log("DB QUERY: ", sql, args);

                if (sql.startsWith("BEGIN")) return {};
                if (sql.startsWith("SELECT * FROM scenes"))
                    return { rows: [{ id: 1 }, { id: 2 }] };
                if (sql.startsWith("SELECT * FROM tasks"))
                    return { rows: [{ id: 1 }] };
                if (sql.startsWith("SELECT * FROM task_data"))
                    return { rows: [] };
                if (sql.startsWith("COMMIT")) return {};

                throw new Error(`Unexpected query in test: ${sql}`);
            },
        );

        await projectsController.deleteProject(mockReq, mockRes, mockNext);

        expect(projectsService.deleteProject).toHaveBeenCalledWith(1);
        expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("deleteProject: нет projectId - error", async () => {
        const mockReq = { params: { projectId: null } } as any;
        const mockRes = { sendStatus: vi.fn() } as any;

        vi.spyOn(projectsService, "deleteProject");
        vi.spyOn(dataBasePool, "query");

        await projectsController.deleteProject(mockReq, mockRes, mockNext);

        expect(projectsService.deleteProject).not.toHaveBeenCalled();
        expect(mockRes.sendStatus).not.toHaveBeenCalled();
        expect(dataBasePool.query).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
    });
});
