import dataBasePool from "@/db/db";

export async function getAll(projectId: string, sceneId: string) {
    return (
        await dataBasePool.query(
            `
        SELECT t.*, p.name AS project_nane, s.name AS scene_name
        FROM tasks t
        JOIN projects p ON t.project = p.id
        JOIN scenes s ON t.scene = s.id
        WHERE LOWER(p.name) = $1
        AND LOWER(s.name) = $2
        ORDER BY t.id;
    `,
            [projectId, sceneId],
        )
    ).rows;
}

export async function updateExecutor(taskId: number, executorId: number) {
    return await dataBasePool.query(
        `
            UPDATE tasks
            SET executor = $1 
            WHERE id = $2;
        `,
        [executorId, taskId],
    );
}

export async function updateStatus(taskId: number, status: number) {
    return await dataBasePool.query(
        `
            UPDATE tasks
            SET status = $1 
            WHERE id = $2;
        `,
        [status, taskId],
    );
}
