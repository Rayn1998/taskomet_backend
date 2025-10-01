import dataBasePool from "@/db/db";

import type IScene from "@shared/types/Scene";
import type IEntityProgress from "@shared/types/EntityProgress";

export async function getAll(projectId: string): Promise<IScene[]> {
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

export async function getScenesProgress(
    sceneId: number,
): Promise<{ status: number; amount: number }[]> {
    return (
        await dataBasePool.query(
            `
        SELECT status, COUNT(*) as amount
        FROM tasks
        WHERE scene = $1
        GROUP BY status
        ORDER BY status; 
    `,
            [sceneId],
        )
    ).rows;
}

export async function getScenesPriority(
    sceneId: number,
): Promise<{ priority: number; amount: number }[]> {
    return (
        await dataBasePool.query(
            `
        SELECT priority, COUNT(*) as amount
        FROM tasks
        WHERE scene = $1
        GROUP BY priority
        ORDER BY priority; 
    `,
            [sceneId],
        )
    ).rows;
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

export async function deleteScene(sceneId: number) {
    return await dataBasePool.query(`DELETE FROM scenes WHERE id = $1`, [
        sceneId,
    ]);
}
