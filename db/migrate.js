import { Pool } from 'pg';

class Migrate {
    constructor(target_database) {
        this.targetDB = target_database;
        this.dataConfig = {
            user: 'postgres',
            host: 'localhost',
            password: 'postgresql',
            port: 5432,
        };
        this.pool = null;
        this.db = null;
    }

    async connectToDb() {
        try {
            const pool = await new Pool({ ...this.dataConfig, database: this.targetDB });
            this.pool = pool;
            this.db = await this.pool.connect();
        } catch (err) {
            console.error(err);
        }
    }

    async endConnection() {
        this.db.release();
        await this.pool.end();
    }

    async recreateDb() {
        const sysPool = new Pool({ ...this.dataConfig, database: 'postgres' });
        const sysClient = await sysPool.connect();

        try {
            await sysClient.query(`
                SELECT pg_terminate_backend(pid)
                FROM pg_stat_activity
                WHERE datname = '${this.targetDB}' AND pid <> pg_backend_pid();
            `);
            await sysClient.query(`DROP DATABASE IF EXISTS ${this.targetDB}`);
            await sysClient.query(`CREATE DATABASE ${this.targetDB}`);
            console.log('Database recreated successfully');
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
                    role INTEGER NOT NULL,
                    tgId VARCHAR(50) NOT NULL
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
                CREATE TABLE scenes(
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(50) NOT NULL,
                    status INTEGER NOT NULL,
                    priority INTEGER NOT NULL,
                    project INTEGER REFERENCES projects(id)
                );
            `);

            await this.db.query(`
                CREATE TABLE tasks(
                    id SERIAL PRIMARY KEY NOT NULL,
                    name VARCHAR(50) NOT NULL,
                    type INTEGER NOT NULL,
                    status INTEGER NOT NULL,
                    executor INTEGER REFERENCES artist(id),
                    priority INTEGER NOT NULL,
                    description VARCHAR(500) NOT NULL,
                    project INTEGER REFERENCES projects(id),
                    scene INTEGER REFERENCES scenes(id)
                );
            `);

            await this.db.query(`
                CREATE TABLE task_data(
                    id SERIAL PRIMARY KEY,
                    task_id INTEGER REFERENCES tasks(id),
                    text VARCHAR(500) NOT NULL,
                    created_at TIMESTAMP NOT NULL,
                    created_by INTEGER REFERENCES artist(id)
                );
            `);

            console.log('Tables succsessfully created');
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
                INSERT INTO scenes(name, status, priority, project)
                VALUES
                    ('SOC', 0, 0, 1),
                    ('BBQ', 0, 0, 1),
                    ('ABC', 0, 0, 2),
                    ('DEF', 0, 0, 2);
            `);
        } catch (err) {
            console.error(err);
        }
    }

    async addTasks() {
        try {
            await this.db.query(`
                INSERT INTO tasks (name, type, status, priority, description, project, scene)
                VALUES
                    ('SOC_0010', 0, 0, 0, 'Трек камеры, добавить пол', 1, 1),
                    ('SOC_0020', 0, 0, 0, 'Камера, добавить гео зеркала', 1, 1),
                    ('BBQ_0450', 0, 0, 0, 'Трек барбекю)', 1, 2),
                    ('BBQ_1085', 0, 0, 0, 'Трек бла-бла)', 1, 2),
                    ('ABC_1982', 0, 0, 0, 'Трек)', 2, 3),
                    ('DEF_0001', 0, 0, 0, 'Трек алфавитов', 2, 4);
            `);
        } catch (err) {
            console.error(err);
        }
    }

    async addTaskData() {
        try {
            await this.db.query(
                `
                INSERT INTO task_data (task_id, text, created_at)
                VALUES
                    (1, 'поправить скачок', $1),
                    (1, 'всё ещё есть дрыги по концу', $2),
                    (2, 'плывёт', $3),
                    (3, 'отлично, спасибо!', $4);

            `,
                [new Date(), new Date(), new Date(), new Date()]
            );
        } catch (err) {
            console.error(err);
        }
    }
}

const migrate = new Migrate('mmpro_tasks');
await migrate.recreateDb();
await migrate.connectToDb();
await migrate.db.query('BEGIN');
try {
    await migrate.createTables();
    await migrate.addProjects();
    await migrate.addScenes();
    await migrate.addTasks();
    await migrate.addTaskData();
    await migrate.db.query('COMMIT');
} catch (err) {
    await migrate.db.query('ROLLBACK');
}
await migrate.endConnection();

process.exit(0);
