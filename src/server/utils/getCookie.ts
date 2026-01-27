import { Request } from "express";

/**
 * Returns the desirable cookie from request
 * @param req - express Request
 * @param name - the name of desirable cookie to get
 * @returns string cookie value or undefined if it's not found
 */
export const getCookie = (req: Request, name: string): string | undefined => {
    const cookies = req.headers.cookie?.split("; ") || [];
    const found = cookies.find((c) => c.startsWith(name + "="));
    return found?.split("=")[1];
};
