import { Request, Response, NextFunction } from "express";
import { ApiError } from "./ApiError";

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    // сделать логгирование ошибок для дальнейшей обработки и анализа

    if (err instanceof ApiError) {
        return res.status(err.status).json({
            message: err.message,
        });
    }

    console.error(err);

    return res.status(500).json({
        message: "Internal server error",
    });
}
