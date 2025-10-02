import "dotenv/config";
import { Pool, PoolClient, DatabaseError } from "pg";
import { rm, access } from "fs/promises";
import { join } from "path";
import DBconfig from "@shared/types/DBconfig";

import { dbData } from "../constant";

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
            if (err instanceof DatabaseError) {
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
                    tg_id INTEGER,
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
                    created_by INTEGER REFERENCES artist(id) NOT NULL
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
                    created_by INTEGER REFERENCES artist(id) NOT NULL
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
                    scene INTEGER REFERENCES scenes(id) ON DELETE CASCADE
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
            INSERT INTO artist (name, user_name, role, photo_url)
            VALUES 
                ('Yuriy Bodolanov', 'bodolanov', 10, 'blob:https://web.telegram.org/976fe224-43df-4c79-bb6e-1ea02f1b4737');
            `);
            /*
                ('Vladimir Korneytsev', 2, 'vvmpro'),
                ('Tim Popov', 0, 'timpopov'),
                ('Anna', 1, 'anna');
            */
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
            // await migrate.addArtists();
            await migrate.addProjects();
            await migrate.addScenes();
            // await migrate.addTasks();
            // await migrate.addTaskData();

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
