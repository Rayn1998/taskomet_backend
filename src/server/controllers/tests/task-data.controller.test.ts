import { describe, expect, it, vi, beforeEach } from "vitest";
import * as taskDataService from "@/server/services/task-data.service";
import * as taskDataController from "@/server/controllers/task-data.controller";
import type ITaskData from "@shared/types/TaskData";
import ffmpeg from "fluent-ffmpeg";

vi.mock("fs/promises", () => ({
    rm: vi.fn().mockResolvedValue(undefined),
    rename: vi.fn().mockResolvedValue(undefined),
}));

// FFMPEG MOCK
vi.mock("fluent-ffmpeg", () => ({
    default: vi.fn(() => ({
        outputOprions: vi.fn().mockReturnThis(),
        save: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
    })),
}));

describe("task-data controller tests", () => {
    const mockReq = {} as any;
    const mockRes = { json: vi.fn(), sendStatus: vi.fn() } as any;
    const mockNext = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("getTaskData: должен вернуть дату - success", async () => {
        const mockReq = { query: { id: "1" } } as any;
        const fakeData = [{}] as ITaskData[];

        vi.spyOn(taskDataService, "getTaskData").mockResolvedValue(fakeData);

        await taskDataController.getTaskData(mockReq, mockRes, mockNext);

        expect(taskDataService.getTaskData).toHaveBeenCalledWith(1);
        expect(mockRes.json).toHaveBeenCalledWith(fakeData);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("getTaskData: должен упасть, нет id - error", async () => {
        vi.spyOn(taskDataService, "getTaskData");

        await taskDataController.getTaskData(mockReq, mockRes, mockNext);

        expect(taskDataService.getTaskData).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
    });

    it("addComment: с видеофайлом, должен вернуть новый коммент - success", async () => {
        const mockReq = {
            body: { data: JSON.stringify({}) },
            file: {
                originalname: "originalName.mov",
                destination: "/media",
                path: "path/to/media",
            },
        } as any;

        let endCb: Function;
        const mockOn = vi.fn((event, cb) => {
            if (event === "end") endCb = cb;
            return { on: mockOn };
        }) as any;
        const mockSave = vi.fn().mockReturnValue({ on: mockOn });

        vi.mocked(ffmpeg).mockImplementation(
            () =>
                ({
                    outputOptions: vi.fn().mockReturnThis(),
                    save: mockSave,
                    on: mockOn,
                } as any),
        );

        vi.spyOn(taskDataService, "addComment").mockResolvedValue({
            id: 1,
        } as any);

        const promise = taskDataController.addComment(
            mockReq,
            mockRes,
            mockNext,
        );

        await endCb!();
        await promise;

        expect(taskDataService.addComment).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({ id: 1 });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("addComment: с медиафайлом-картинкой, должен вернуть новый коммент - success", async () => {
        const mockReq = {
            body: { data: JSON.stringify({}) },
            file: {
                originalname: "originalName.jpg",
                destination: "/media",
                path: "path/to/media",
            },
        } as any;

        vi.spyOn(taskDataService, "addComment").mockResolvedValue({
            id: 1,
        } as any);

        await taskDataController.addComment(mockReq, mockRes, mockNext);

        expect(taskDataService.addComment).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({ id: 1 });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("addComment: без медиафайла, должен вернуть новый коммент - success", async () => {
        const mockReq = {
            body: { data: JSON.stringify({}) },
        } as any;

        vi.spyOn(taskDataService, "addComment").mockResolvedValue({
            id: 1,
        } as any);

        await taskDataController.addComment(mockReq, mockRes, mockNext);

        expect(taskDataService.addComment).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith({ id: 1 });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("deleteComment: удаляет коммент, возвращает статус 200 - success", async () => {
        const mockReq = { params: { id: "1" } } as any;

        vi.spyOn(taskDataService, "deleteComment").mockResolvedValue({} as any);

        await taskDataController.deleteComment(mockReq, mockRes, mockNext);

        expect(taskDataService.deleteComment).toHaveBeenCalledWith(1);
        expect(mockRes.sendStatus).toHaveBeenCalledWith(200);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("deleteComment: не находит коммент, падает - error", async () => {
        const mockReq = { params: { id: "1" } } as any;

        vi.spyOn(taskDataService, "deleteComment").mockRejectedValue(undefined);

        await taskDataController.deleteComment(mockReq, mockRes, mockNext);

        expect(taskDataService.deleteComment).toHaveBeenCalledWith(1);
        expect(mockRes.sendStatus).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
    });

    it("deleteComment: нет id, падает - error", async () => {
        vi.spyOn(taskDataService, "deleteComment");

        await taskDataController.deleteComment(mockReq, mockRes, mockNext);

        expect(taskDataService.deleteComment).not.toHaveBeenCalled();
        expect(mockRes.sendStatus).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
    });
});
