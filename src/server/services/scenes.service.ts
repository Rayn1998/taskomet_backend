import dataBasePool from "@/db/db";

import type IScene from "@shared/types/Scene";
import type { ISceneData } from "@shared/types/EntityData";
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

export async function getSceneData(sceneId: number): Promise<ISceneData[]> {
    return (
        await dataBasePool.query(
            `
        SELECT sd.*
        FROM scene_data sd
        JOIN scenes s ON sd.scene_id = s.id
        WHERE sd.scene_id = $1;
        `,
            [sceneId],
        )
    ).rows;
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

export async function addMedia(sceneData: ISceneData) {
    const { scene_id, text, media, created_at, created_by } = sceneData;

    if (media) {
        await dataBasePool.query("BEGIN");

        const res = (
            await dataBasePool.query(
                `
                    INSERT INTO scene_data (scene_id, text, media, created_by, created_at)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *;
                    `,
                [scene_id, text, media, created_by, created_at],
            )
        ).rows[0];
        await dataBasePool.query("COMMIT");

        return res;
    } else {
        await dataBasePool.query("BEGIN");

        const res = (
            await dataBasePool.query(
                `
                    INSERT INTO scene_data (scene_id, text, created_by, created_at)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *;
                    `,
                [scene_id, text, created_by, created_at],
            )
        ).rows[0];
        await dataBasePool.query("COMMIT");

        return res;
    }
}

export async function deleteSceneMedia(mediaId: number): Promise<ISceneData> {
    return (
        await dataBasePool.query(
            `
        DELETE FROM scene_data
        WHERE id = $1
        RETURNING *;
        `,
            [mediaId],
        )
    ).rows[0];
}
