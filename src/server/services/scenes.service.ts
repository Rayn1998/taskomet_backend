import dataBasePool from "@/db/db";

export async function getAll(projectId: string) {
    const result = await dataBasePool.query(
        `
        SELECT scenes.*
        FROM scenes
        JOIN projects ON scenes.project = projects.id
        WHERE LOWER(projects.name) = $1
    `,
        [projectId],
    );
    return result.rows;
}

export async function createScene(
    name: string,
    projectId: number,
    description: string,
) {
    const result = await dataBasePool.query(
        `
        INSERT INTO scenes(name, status, priority, project, description)
        VALUES ($1, 0, 0, $2, $3)
        RETURNING *;
    `,
        [name, projectId, description],
    );
    return result.rows[0];
}
