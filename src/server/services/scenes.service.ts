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
