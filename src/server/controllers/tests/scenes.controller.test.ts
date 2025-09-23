import { describe, it, expect, vi, beforeEach } from "vitest";
import * as scenesController from "@/server/controllers/scenes.controller";
import * as scenesService from "@/server/services/scenes.service";
import * as fs from "fs/promises";

vi.mock("fs/promises", () => {
    return {
        rm: vi.fn().mockResolvedValue(undefined),
    };
});

// TYPES
import type IScene from "@shared/types/Scene";
import type ITaskData from "@shared/types/TaskData";
import dataBasePool from "@/db/db";

describe("scenes controller", () => {
    const mockReq = {} as any;
    const mockRes = { json: vi.fn(), sendStatus: vi.fn() } as any;
    const mockNext = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("getScenes: должен вернуть список сцен", async () => {
        const mockReq = { params: { projectId: "1" } } as any;

        const fakeScenes: IScene[] = [
            {
                id: 1,
                project: 1,
                status: 0,
                name: "dawd",
                description: "25",
                priority: 0,
            },
        ];

        vi.spyOn(scenesService, "getAll").mockResolvedValue(fakeScenes);

        await scenesController.getScenes(mockReq, mockRes, mockNext);

        expect(scenesService.getAll).toHaveBeenCalledWith("1");
        expect(mockRes.json).toHaveBeenCalledWith(fakeScenes);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("getScenes: должен упасть с ошибкой в next", async () => {
        const error = new Error("DB error");
        const mockReq = { params: { projectId: "1" } } as any;

        vi.spyOn(scenesService, "getAll").mockRejectedValue(error);

        await scenesController.getScenes(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("createScene: должен вернуть новую сцену - success", async () => {
        const mockReq = {
            body: {
                name: "abc",
                description: "такая вот сцена",
            },
            params: {
                projectName: "1",
            },
        } as any;

        const fakeScene: IScene = {
            id: 1,
            project: 1,
            status: 0,
            priority: 0,
            name: "abc",
            description: "такая вот сцена",
        };

        vi.spyOn(dataBasePool, "query").mockImplementation(async (sql) => {
            if (sql.startsWith("BEGIN")) return {};
            if (sql.startsWith("SELECT id FROM projects"))
                return { rows: [{ id: 1 }] };
            if (sql.startsWith("COMMIT")) return {};

            throw new Error(`Unexpected query in test: ${sql}`);
        });

        vi.spyOn(scenesService, "createScene").mockResolvedValue(fakeScene);

        await scenesController.createScene(mockReq, mockRes, mockNext);

        expect(scenesService.createScene).toHaveBeenCalledWith(
            "abc",
            1,
            "такая вот сцена",
        );
        expect(mockRes.json).toHaveBeenCalledWith(fakeScene);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("createScene: должен пробросить ошибку, пустой body - error", async () => {
        vi.spyOn(scenesService, "createScene");
        vi.spyOn(dataBasePool, "query");

        await scenesController.createScene(mockReq, mockRes, mockNext);

        expect(dataBasePool.query).not.toHaveBeenCalled();
        expect(scenesService.createScene).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
    });

    it("deleteScene: должен удалить сцену - success", async () => {
        const mockReq = { params: { sceneId: "1" } } as any;

        vi.spyOn(dataBasePool, "query").mockImplementation(async (sql) => {
            if (sql.startsWith("BEGIN")) return {};
            if (sql.startsWith("SELECT id FROM")) return { rows: [{ id: 1 }] };
            if (sql.startsWith("SELECT * FROM task_data"))
                return { rows: [{ media: null }] } as unknown as ITaskData[];
            if (sql.startsWith("COMMIT")) return {};

            throw new Error(`Unexpected query in test: ${sql}`);
        });
        vi.spyOn(scenesService, "deleteScene").mockResolvedValue({} as any);

        await scenesController.deleteScene(mockReq, mockRes, mockNext);

        expect(scenesService.deleteScene).toHaveBeenCalledWith(1);
        expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
        expect(mockNext).not.toHaveBeenCalled();
    });
    it("deleteScene: должен упасть, нет sceneId - error", async () => {
        vi.spyOn(scenesService, "deleteScene");
        vi.spyOn(dataBasePool, "query");

        await scenesController.deleteScene(mockReq, mockRes, mockNext);

        expect(dataBasePool.query).not.toHaveBeenCalled();
        expect(scenesService.deleteScene).not.toHaveBeenCalled();
        expect(mockRes.sendStatus).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
    });
});
