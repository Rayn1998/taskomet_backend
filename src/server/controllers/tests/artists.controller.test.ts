import { describe, it, expect, afterEach, vi } from "vitest";
import * as artistController from "@/server/controllers/artists.controller";
import * as artistService from "@/server/services/artists.service";
import IArtist from "@shared/types/Artist";

describe("artists controller", () => {
    const mockReq = {} as any;
    const mockRes = {
        json: vi.fn(),
    } as any;
    const mockNext = vi.fn();

    afterEach(() => {
        vi.clearAllMocks();
        vi.resetAllMocks();
    });

    it("getArtists: должен вернуть список артистов", async () => {
        const fakeArtists: IArtist[] = [
            {
                id: 1,
                name: "Yuriy Bodolanov",
                role: 10,
                user_name: "bodolanov",
                photo_url: "photo.jpg",
                tg_id: 1234,
            },
        ];
        vi.spyOn(artistService, "getAll").mockResolvedValue(fakeArtists);

        await artistController.getArtists(mockReq, mockRes, mockNext);

        expect(artistService.getAll).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith(fakeArtists);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("getArtists: должен пробросить ошибку в next", async () => {
        const error = new Error("DB error");

        vi.spyOn(artistService, "getAll").mockRejectedValue(error);

        await artistController.getArtists(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("createArtist: должен вернуть нового артиста", async () => {
        const mockReq = {
            body: {
                tg_id: 1234,
                name: "Yuriy Bodolanov",
                role: 10,
                user_name: "bodolanov",
                photo_url: "photo.jpg",
            },
        } as any;

        const fakeArtist: IArtist = {
            id: 1,
            name: "Yuriy Bodolanov",
            role: 10,
            tg_id: 1234,
            user_name: "bodolanov",
            photo_url: "photo.jpg",
        };

        vi.spyOn(artistService, "createArtist").mockResolvedValue(fakeArtist);

        await artistController.createArtist(mockReq, mockRes, mockNext);

        expect(artistService.createArtist).toHaveBeenCalledWith({
            name: "Yuriy Bodolanov",
            role: 10,
            tg_id: 1234,
            user_name: "bodolanov",
            photo_url: "photo.jpg",
        });
        expect(mockRes.json).toHaveBeenCalledWith(fakeArtist);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("createArtist: должен пробросить ошибку DB в next", async () => {
        const mockReq = {
            body: {
                tg_id: 1234,
                name: "Yuriy Bodolanov",
                role: 10,
                user_name: "bodolanov",
                photo_url: "photo.jpg",
            },
        } as any;

        const error = new Error("DB error");

        vi.spyOn(artistService, "createArtist").mockRejectedValue(error);

        await artistController.createArtist(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("createArtist: пришёл пустой body - error", async () => {
        const mockReq = {
            body: {},
        } as any;

        vi.spyOn(artistService, "createArtist");

        await artistController.createArtist(mockReq, mockRes, mockNext);

        expect(artistService.createArtist).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
    });
});
