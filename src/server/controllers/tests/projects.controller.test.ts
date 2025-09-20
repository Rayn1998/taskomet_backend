import { describe, it, expect, vi } from "vitest";
import * as projectsController from "@/server/controllers/projects.controller";
import * as projectsService from "@/server/services/projects.service";

import IProject from "@shared/types/Project";

describe("projects controller", () => {
    const mockReq = {} as any;
    const mockRes = { json: vi.fn() } as any;
    const mockNext = vi.fn();

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
});
