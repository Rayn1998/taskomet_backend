import { Request, Response, NextFunction } from "express";
import { ApiError } from "./ApiError";

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    // console.error(err);
    // сделать логгирование ошибок для дальнейшей обработки и анализа

    if (err instanceof ApiError) {
        return res.status(err.status).json({
            error: {
                message: err.message,
            },
        });
    }

    return res.status(500).json({
        error: {
            message: "Internal Server Error",
        },
    });
}
