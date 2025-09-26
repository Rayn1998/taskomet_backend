import dataBasePool from "@/db/db";

import IProject from "@shared/types/Project";
import IProjectProgress from "@shared/types/ProjectProgress";

export async function getAll(): Promise<IProject[]> {
    return (await dataBasePool.query("SELECT * FROM projects")).rows;
}

export async function getProjectsProgress(
    projectId: number,
): Promise<IProjectProgress[]> {
    return (
        await dataBasePool.query(
            `
        SELECT status, COUNT(*) as amount
        FROM tasks
        WHERE project = $1
        GROUP BY status
        ORDER BY status; 
    `,
            [projectId],
        )
    ).rows;
}

export async function createProject(
    name: string,
    description: string,
): Promise<IProject> {
    return (
        await dataBasePool.query(
            `
        INSERT INTO projects(name, status, description, priority)
        VALUES ($1, 0, $2, 0)
        RETURNING *;
        `,
            [name, description],
        )
    ).rows[0];
}

export async function deleteProject(projectId: number) {
    return await dataBasePool.query(`DELETE FROM projects WHERE id = $1;`, [
        projectId,
    ]);
}
