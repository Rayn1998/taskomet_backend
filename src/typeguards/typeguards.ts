import { DatabaseError } from "pg";

export const isDatabaseError = (err: unknown): err is DatabaseError => {
    return err instanceof DatabaseError;
};
