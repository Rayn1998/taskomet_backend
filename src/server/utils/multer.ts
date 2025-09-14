import { randomBytes } from "crypto";
import multer from "multer";

import { checkFolders } from "@/server/utils/writeFiles";

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const path = await checkFolders();
        cb(null, path);
    },
    filename: async function (req, file, cb) {
        const extension = file.originalname.split(".").slice(-1)[0];
        const hexCode = randomBytes(4).toString("hex");
        const newName = hexCode + "." + extension;
        cb(null, newName);
    },
});

export const multerInstance = multer({
    storage,
});
