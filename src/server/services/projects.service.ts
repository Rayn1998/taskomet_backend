import dataBasePool from "@/db/db";

export async function getAll() {
    const result = await dataBasePool.query("SELECT * FROM projects");
    return result.rows;
}

export async function createProject(name: string, description: string) {
    const result = await dataBasePool.query(
        `
        INSERT INTO projects(name, status, description, priority)
        VALUES ($1, 0, $2, 0);
        `,
        [name, description],
    );
    return result.rows[0];
}
