import express from 'express';
import { Pool } from 'pg';

import projectRoutes from './routes/projects.routes';

class Server {
    db: Pool;
    port: number;

    constructor(dbInstance: Pool, port = 3001) {
        this.db = dbInstance;
        this.port = port;
    }

    run() {
        const app = express();
        app.use(express.json());

        app.use('/projects', projectRoutes);

        app.listen(this.port, () => {
            console.log(`Server started to listen on ${this.port} port`);
        });
    }
}

export default Server;
