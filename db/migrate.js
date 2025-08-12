import { Pool } from 'pg';

class Migrate {
    constructor(target_database) {
        this.targetDB = target_database;
        this.dataConfig = {
            user: 'postgres',
            host: 'localhost',
            password: '1324',
            port: 5432,
        };
        this.db = null;
    }

    async recreateDb() {
        const sysPool = new Pool({ ...this.dataConfig, database: "postgres" });
        const sysClient = await sysPool.connect();

        try {
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
        this.db = await new Pool({ ...this.dataConfig, database: this.targetDB }).connect();

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

            console.log("Tables succsessfully created");
        } catch (err) {
            console.error(err);
        } finally {
            await this.db.end();
        }
    }

    // async addProjects() {
    //     this.db = await new Pool({ ...this.dataConfig, database: this.targetDB }).connect();

    //     try {
    //         await this.db.query(`
    //             INSERT INTO projects()    
    //         `)
    //     } 
    // }
}


const migrate = new Migrate('mmpro_tasks');
await migrate.recreateDb();
await migrate.createTables();

process.exit(0);
