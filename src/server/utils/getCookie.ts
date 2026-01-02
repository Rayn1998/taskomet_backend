import { Request } from "express";

export const getCookie = (req: Request, name: string) => {
    const cookies = req.headers.cookie?.split("; ") || [];
    const found = cookies.find((c) => c.startsWith(name + "="));
    return found?.split("=")[1];
};
