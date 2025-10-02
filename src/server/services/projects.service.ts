import dataBasePool from "@/db/db";

import type IProject from "@shared/types/Project";
import type { IProjectData } from "@shared/types/EntityData";

export async function getAll(): Promise<IProject[]> {
    return (await dataBasePool.query("SELECT * FROM projects")).rows;
}

export async function getProjectData(
    projectId: number,
): Promise<IProjectData[]> {
    return (
        await dataBasePool.query(
            `
        SELECT pd.*
        FROM project_data pd
        JOIN projects p ON pd.project_id = p.id
        WHERE pd.project_id = $1;
        `,
            [projectId],
        )
    ).rows;
}

export async function getProjectsProgress(
    projectId: number,
): Promise<{ status: number; amount: number }[]> {
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

export async function getProjectsPriority(
    projectId: number,
): Promise<{ priority: number; amount: number }[]> {
    return (
        await dataBasePool.query(
            `
        SELECT priority, COUNT(*) as amount
        FROM tasks
        WHERE project = $1
        GROUP BY priority
        ORDER BY priority; 
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

export async function addMedia(projectData: IProjectData) {
    const { project_id, text, media, created_at, created_by } = projectData;

    if (media) {
        await dataBasePool.query("BEGIN");

        const res = (
            await dataBasePool.query(
                `
                    INSERT INTO project_data (project_id, text, media, created_by, created_at)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *;
                    `,
                [project_id, text, media, created_by, created_at],
            )
        ).rows[0];
        await dataBasePool.query("COMMIT");

        return res;
    } else {
        await dataBasePool.query("BEGIN");

        const res = (
            await dataBasePool.query(
                `
                    INSERT INTO project_data (project_id, text, created_by, created_at)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *;
                    `,
                [project_id, text, created_by, created_at],
            )
        ).rows[0];
        await dataBasePool.query("COMMIT");

        return res;
    }
}

export async function deleteProjectMedia(
    mediaId: number,
): Promise<IProjectData> {
    return (
        await dataBasePool.query(
            `
        DELETE FROM project_data
        WHERE id = $1
        RETURNING *;
        `,
            [mediaId],
        )
    ).rows[0];
}
