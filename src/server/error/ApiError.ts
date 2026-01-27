export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }

    static badRequest(msg: string) {
        return new ApiError(400, msg);
    }

    static conflict(msg: string) {
        return new ApiError(409, msg);
    }

    static notFound(msg: string) {
        return new ApiError(404, msg);
    }

    static internalError(msg: string) {
        return new ApiError(500, msg);
    }
}
