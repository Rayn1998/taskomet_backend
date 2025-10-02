import { randomBytes } from "crypto";
import { join } from "path";
import * as fs from "fs/promises";

import ffmpeg from "fluent-ffmpeg";

export const saveMedia = async (
    data: any,
    file: any,
    successCb: Function,
    failCb: Function,
) => {
    if (file) {
        const newName = randomBytes(4).toString("hex");
        const ext = file.originalname.split(".").slice(-1)[0].toLowerCase();

        if (ext === "mp4" || ext === "mov") {
            const fullPath = join(file.destination, newName + ".mp4");
            const relativePath = fullPath.split("/").slice(-3).join("/");

            ffmpeg(file.path)
                .outputOptions([
                    "-c:v libx264",
                    "-c:a aac",
                    "-movflags +faststart",
                ])
                .save(fullPath)
                .on("end", async () => {
                    await fs.rm(file!.path);
                    data.media = relativePath;
                    // onSuccess
                    successCb();
                    // --------
                })
                .on("error", (err) => {
                    // onFail
                    failCb();
                    // --
                });
        } else {
            const fullPath = join(file.destination, newName + "." + ext);
            const relativePath = fullPath.split("/").slice(-3).join("/");
            await fs.rename(file.path, fullPath);
            data.media = relativePath;
            // onSuccess
            successCb();
            // ----
        }
    } else {
        // onSuccess
        successCb();
    }
};
