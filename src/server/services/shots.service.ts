import dataBasePool from "@/db/db";

import type IShot from "@shared/types/Shot";

export async function getAll(
    projectName: string,
    sceneName: string,
): Promise<IShot[]> {
    const result = await dataBasePool.query(
        `
        SELECT shots.*
        FROM shots
        JOIN projects ON shots.project = projects.id
        JOIN scenes ON shots.scene = scenes.id
        WHERE LOWER(projects.name) = $1 
        AND LOWER(scenes.name) = $2;
    `,
        [projectName, sceneName],
    );
    return result.rows;
}
