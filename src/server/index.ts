import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { Pool } from "pg";
import projectRoutes from "@/server/routes/projects.routes";
import taskDataRoutes from "@/server/routes/task-data.routes";
import { errorHandler } from "@/server/error/errorHandler";

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
        app.use("/task-data", taskDataRoutes);
        app.use("/check-server", checkServerConnection);

        app.use(errorHandler);

        app.listen(this.port, () => {
            console.log(`Server started to listen on ${this.port} port`);
        });
    }
}

export default Server;
