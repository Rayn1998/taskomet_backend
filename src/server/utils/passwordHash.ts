import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const asyncScrypt = promisify(scrypt);

export const hashPassword = async (password: string): Promise<string> => {
    const salt = randomBytes(16).toString("hex");
    const hash = (await asyncScrypt(password, salt, 64)) as Buffer;
    return `${salt}:${hash.toString("hex")}`;
};

export const verifyPassword = async (
    password: string,
    hash: string,
): Promise<boolean> => {
    const [salt, storedKey] = hash.split(":");
    const key = (await asyncScrypt(password, salt, 64)) as Buffer;
    return timingSafeEqual(Buffer.from(storedKey, "hex"), key);
};
