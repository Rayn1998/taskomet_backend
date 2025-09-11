import express from "express";

import cors from "cors";
import { Pool } from "pg";
import projectRoutes from "@/server/routes/projects.routes";
import taskRoutes from "@/server/routes/task.routes";
import { errorHandler } from "@/server/error/errorHandler";
import {
    getArtists,
    createArtist,
} from "@/server/controllers/artists.controller";

import { checkServerConnection } from "@/server/controllers/check-server.controller";

class Server {
    db: Pool;
    port: number;

    constructor(dbInstance: Pool, port = 3001) {
        this.db = dbInstance;
        this.port = port;
    }

    run() {
        const app = express();

        app.use(
            cors({
                origin: ["http://127.0.0.1:3000", "http://localhost:3000"],
            }),
        );
        app.use(express.json());

        app.use("/projects", projectRoutes);
        app.use("/task", taskRoutes);
        app.use("/check-server", checkServerConnection);
        app.get("/get-artist", getArtists);
        app.post("/create-artist", createArtist);

        app.use(errorHandler);

        app.listen(this.port, () => {
            console.log(`Server started to listen on ${this.port} port`);
        });
    }
}

export default Server;
