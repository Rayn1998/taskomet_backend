import { Message, CallbackQuery } from "node-telegram-bot-api";
import { DatabaseError } from "pg";

export const isMessage = (input: any): input is Message => {
    return input && typeof input.text === "string" && input.chat !== undefined;
};

export const isCallbackQuery = (input: any): input is CallbackQuery => {
    return input && typeof input.data === "string" && input.id !== undefined;
};

export const isDatabaseError = (err: unknown): err is DatabaseError => {
    return err instanceof DatabaseError;
};
