import "dotenv/config";
import { Pool, PoolClient } from "pg";
import { rm, access } from "fs/promises";
import { join } from "path";
import DBconfig from "@shared/types/DBconfig";

import { dbData } from "../constant";

import { isDatabaseError } from "../typeguards/typeguards";

class Migrate {
    targetDB: string;
    dataConfig: DBconfig;
    pool!: Pool;
    db!: PoolClient;

    constructor(dataConfig: DBconfig) {
        this.targetDB = dataConfig.database;
        this.dataConfig = dataConfig;
    }

    async connectToDb() {
        try {
            const pool = await new Pool({
                ...this.dataConfig,
                database: this.targetDB,
            });
            this.pool = pool;
            this.db = await this.pool.connect();
        } catch (err) {
            if (isDatabaseError(err)) {
                if (err.code === "28P01") {
                    console.log("Incorrect password to db");
                }
                process.exit(1);
            } else {
                console.error(err);
                process.exit(1);
            }
        }
    }

    async endConnection() {
        this.db.release();
        await this.pool.end();
    }

    async recreateDb() {
        const sysPool = new Pool({ ...this.dataConfig, database: "postgres" });
        const sysClient = await sysPool.connect();

        try {
            await sysClient.query(`
                SELECT pg_terminate_backend(pid)
                FROM pg_stat_activity
                WHERE datname = '${this.targetDB}' AND pid <> pg_backend_pid();
            `);
            await sysClient.query(`DROP DATABASE IF EXISTS ${this.targetDB}`);
            await sysClient.query(`CREATE DATABASE ${this.targetDB}`);
            console.log("Database recreated successfully");
        } catch (err) {
            console.error(err);
        } finally {
            sysClient.release();
            await sysPool.end();
        }
    }

    async createTables() {
        try {
            await this.db.query(`
                CREATE TABLE artist (
                    id SERIAL PRIMARY KEY NOT NULL,
                    name VARCHAR(50) NOT NULL,
                    user_name VARCHAR(50) NOT NULL UNIQUE,
                    email VARCHAR(50) NOT NULL UNIQUE,
                    password VARCHAR(200) NOT NULL,
                    tg_id BIGINT,
                    role INTEGER NOT NULL,
                    photo_url VARCHAR(100)
                );
            `);

            await this.db.query(`
                CREATE TABLE projects(
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(50) NOT NULL,
                    status INTEGER NOT NULL,
                    description VARCHAR(1000),
                    priority INTEGER NOT NULL
                );
            `);

            await this.db.query(`
                CREATE TABLE project_data(
                    id SERIAL PRIMARY KEY,
                    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
                    text VARCHAR(1000),
                    media VARCHAR(100),
                    created_at TIMESTAMP NOT NULL,
                    created_by INTEGER REFERENCES artist(id) ON DELETE SET NULL
                );
            `);

            await this.db.query(`
                CREATE TABLE scenes(
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(50) NOT NULL,
                    status INTEGER NOT NULL,
                    description VARCHAR(1000),
                    priority INTEGER NOT NULL,
                    project INTEGER REFERENCES projects(id) ON DELETE CASCADE
                );
            `);

            await this.db.query(`
                CREATE TABLE scene_data(
                    id SERIAL PRIMARY KEY,
                    scene_id INTEGER REFERENCES scenes(id) ON DELETE CASCADE,
                    text VARCHAR(1000),
                    media VARCHAR(100),
                    created_at TIMESTAMP NOT NULL,
                    created_by INTEGER REFERENCES artist(id) ON DELETE SET NULL
                );
            `);

            await this.db.query(`
                CREATE TABLE shots(
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(50) NOT NULL,
                    status INTEGER NOT NULL,
                    priority INTEGER NOT NULL,
                    description VARCHAR(500),
                    scene INTEGER REFERENCES scenes(id) ON DELETE CASCADE,
                    project INTEGER REFERENCES projects(id) ON DELETE CASCADE
                );
            `);

            await this.db.query(`
                CREATE TABLE shot_data(
                    id SERIAL PRIMARY KEY,
                    shot_id INTEGER REFERENCES shots(id) ON DELETE CASCADE,
                    text VARCHAR(1000),
                    media VARCHAR(100),
                    created_at TIMESTAMP NOT NULL,
                    created_by INTEGER REFERENCES artist(id) ON DELETE SET NULL
                );
            `);

            await this.db.query(`
                CREATE TABLE tasks(
                    id SERIAL PRIMARY KEY NOT NULL,
                    name VARCHAR(50) NOT NULL,
                    type INTEGER NOT NULL,
                    status INTEGER NOT NULL,
                    executor INTEGER REFERENCES artist(id) ON DELETE SET NULL,
                    priority INTEGER NOT NULL,
                    description VARCHAR(500) NOT NULL,
                    project INTEGER REFERENCES projects(id) ON DELETE CASCADE,
                    scene INTEGER REFERENCES scenes(id) ON DELETE CASCADE,
                    shot INTEGER REFERENCES shots(id) ON DELETE CASCADE
                );
            `);

            await this.db.query(`
                CREATE TABLE task_data(
                    id SERIAL PRIMARY KEY,
                    type INTEGER NOT NULL,
                    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
                    text VARCHAR(500),
                    media VARCHAR(100),
                    created_at TIMESTAMP NOT NULL,
                    created_by INTEGER REFERENCES artist(id) ON DELETE SET NULL,
                    status INTEGER,
                    spent_hours NUMERIC(4, 1)
                );
            `);

            await this.db.query(`
                CREATE TABLE sessions(
                    id TEXT PRIMARY KEY,
                    user_id INTEGER REFERENCES artist(id),
                    expires_at TIMESTAMP NOT NULL
                );    
            `);

            console.log("Tables succsessfully created");
        } catch (err) {
            console.error(err);
        }
    }

    async addProjects() {
        try {
            await this.db.query(`
                INSERT INTO projects(name, status, description, priority)
                VALUES
                    ('Eterna', 0, 'fps - 24', 0),
                    ('HOL', 0, 'fps - 25', 0);
            `);
        } catch (err) {
            console.error(err);
        }
    }

    async addScenes() {
        try {
            await this.db.query(`
                INSERT INTO scenes(name, status, priority, project, description)
                VALUES
                    ('SOC', 0, 0, 1, 'в этой сцене в основном трек запястий'),
                    ('BBQ', 0, 0, 1, 'трек головы главного героя'),
                    ('ABC', 0, 0, 2, 'трек камеры, плейны на домики'),
                    ('DEF', 0, 0, 2, 'камера, обджект трек автомобиля');
            `);
        } catch (err) {
            console.error(err);
        }
    }

    async addTasks() {
        try {
            await this.db.query(`
                INSERT INTO tasks (name, type, status, executor, priority, description, project, scene)
                VALUES
                    ('0010', 0, 3, 3, 0, 'Трек камеры, добавить пол', 1, 1),
                    ('0020', 0, 3, 2, 0, 'Камера, добавить гео зеркала', 1, 1),
                    ('0450', 0, 5, 1, 0, 'Трек барбекю)', 1, 2),
                    ('1085', 0, 0, 4, 0, 'Трек бла-бла)', 1, 2),
                    ('1982', 0, 0, 1, 0, 'Трек)', 2, 3),
                    ('0001', 0, 0, 1, 0, 'Трек алфавитов', 2, 4);
            `);
        } catch (err) {
            console.error(err);
        }
    }

    async addTaskData() {
        try {
            await this.db.query(
                `
                INSERT INTO task_data (task_id, text, created_at, created_by, type, status, spent_hours)
                VALUES
                    (1, 'поправить скачок', $1, 1, 1, 3, 1),
                    (1, 'всё ещё есть дрыги по концу', $2, 3, 1, 3, 3),
                    (2, 'плывёт', $3, 2, 1, 3, 1.5),
                    (3, 'отлично, спасибо!', $4, 1, 1, 5, 3.5);

            `,
                [new Date(), new Date(), new Date(), new Date()],
            );
        } catch (err) {
            console.error(err);
        }
    }

    async addArtists() {
        try {
            await this.db.query(`
            INSERT INTO artist (name, user_name, email, password, role)
            VALUES 
                ('Yuriy Bodolanov', 'bodolanov', 'test@mail.ru', '4fd4ddb5f003396885fc4db4d572fa5c:423302ceb85216cce76d0bb069a779da94d5510ece77893496163227ab4b2342afae5168e72943a28443721700c7b461db996d08e583966d609e497db1cd8de5', 10),
                ('Test User 1', 'bodolanov1', 'test1@mail.ru', '4fd4ddb5f003396885fc4db4d572fa5c:423302ceb85216cce76d0bb069a779da94d5510ece77893496163227ab4b2342afae5168e72943a28443721700c7b461db996d08e583966d609e497db1cd8de5', 1),
                ('Test User 2', 'bodolanov2', 'test2@mail.ru', '4fd4ddb5f003396885fc4db4d572fa5c:423302ceb85216cce76d0bb069a779da94d5510ece77893496163227ab4b2342afae5168e72943a28443721700c7b461db996d08e583966d609e497db1cd8de5', 1),
                ('Test User 3', 'bodolanov3', 'test3@mail.ru', '4fd4ddb5f003396885fc4db4d572fa5c:423302ceb85216cce76d0bb069a779da94d5510ece77893496163227ab4b2342afae5168e72943a28443721700c7b461db996d08e583966d609e497db1cd8de5', 1);
            `);
        } catch (err) {
            console.error(err);
        }
    }
}

async function removeUploads() {
    try {
        const uploadsPath = join(process.cwd(), "uploads");
        const exist = await access(uploadsPath);
        if (typeof exist === "undefined")
            return await rm(uploadsPath, { recursive: true });
    } catch (err) {
        console.error(err);
    }
}

async function migration() {
    const migrate = new Migrate({ ...dbData, database: process.env.DB_NAME! });

    try {
        await removeUploads();
        await migrate.recreateDb();

        await migrate.connectToDb();
        await migrate.db.query("BEGIN");
        try {
            await migrate.createTables();
            await migrate.addArtists();
            await migrate.addProjects();
            await migrate.addScenes();
            await migrate.addTasks();
            await migrate.addTaskData();

            await migrate.db.query("COMMIT");
            console.log("Migration completed");
        } catch (err) {
            await migrate.db.query("ROLLBACK");
            console.error("Migration failed, transaction rolled back", err);
        }
    } catch (err) {
        console.error("Migration script failed", err);
        process.exit(1);
    } finally {
        await migrate.endConnection();
        process.exit(0);
    }
}

migration();
