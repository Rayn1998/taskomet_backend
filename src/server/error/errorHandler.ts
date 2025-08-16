import { Request, Response, NextFunction } from 'express';
import { ApiError } from './ApiError';

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof ApiError) {
        return res.status(err.status).json({
            error: {
                message: err.message,
                status: err.status,
                dedails: err.details || null,
            },
        });
    }

    return res.status(500).json({
        error: {
            message: 'Internal Server Error',
            status: 500,
        },
    });
}
