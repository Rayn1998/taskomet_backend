import express from "express";
import { join } from "path";

import cors from "cors";
import { Pool } from "pg";
// import Bot from "@/bot/bot.service";
import projectRoutes from "@/server/routes/projects.routes";
import taskRoutes from "@/server/routes/task.routes";
import { errorHandler } from "@/server/error/errorHandler";
import {
    getArtists,
    getArtist,
    createArtist,
    updateArtistRole,
    updateArtistAfterRegister,
} from "@/server/controllers/artists.controller";
import { getMyTasks } from "@/server/controllers/tasks.controller";
import { checkServerConnection } from "@/server/controllers/check-server.controller";

class Server {
    db: Pool;
    // botInstance: Bot;
    port: number;

    constructor(dbInstance: Pool, port = 3001) {
        this.db = dbInstance;
        // this.botInstance = botInstance;
        this.port = port;
    }

    run() {
        const app = express();

        app.use(
            cors({
                origin: [
                    "http://localhost:3000",
                    "http://192.168.31.134:3000",
                    "http://127.0.0.1:3000",
                    "https://fifty-houses-teach.loca.lt",
                ],
            }),
        );
        app.use(express.json());

        const uploadsPath = join(process.cwd(), "uploads");
        app.use("/uploads", express.static(uploadsPath));
        console.log("Serving uploads from:", uploadsPath);
        app.use("/projects", projectRoutes);
        app.use("/my-tasks/:executorId", getMyTasks);
        app.use("/task", taskRoutes);
        app.use("/check-server", checkServerConnection);

        // this.botInstance.sendMessage()

        // artist
        app.get("/get-artist", getArtists);
        app.get("/get-artist/:user_name", getArtist);
        app.post("/create-artist", createArtist);
        app.patch("/artist-role", updateArtistRole);
        app.patch("/update-new-artist", updateArtistAfterRegister);

        app.get("/download/:folder/:filename", (req, res, next) => {
            const { folder, filename } = req.params;

            const filePath = join(process.cwd(), "uploads", folder, filename);

            res.download(filePath, filename, (err) => {
                if (err) {
                    next(err);
                }
            });
        });

        app.use(errorHandler);

        app.listen(this.port, () => {
            console.log(`Server started to listen on ${this.port} port`);
        });
    }
}

export default Server;
