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

export async function createTask(
    name: string,
    description: string,
    projectId: number,
    sceneId: number,
) {
    return (
        await dataBasePool.query(
            `
        INSERT INTO tasks (name, description, project, scene, type, status, priority)
        VALUES ($1, $2, $3, $4, 0, 0, 0)
        RETURNING *;
    `,
            [name, description, projectId, sceneId],
        )
    ).rows[0];
}

export async function deleteTask(id: number) {
    return await dataBasePool.query(
        `
        DELETE FROM tasks
        WHERE id = $1
        RETURNING *;
    `,
        [id],
    );
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

export async function updatePriority(taskId: number, pirority: number) {
    return await dataBasePool.query(
        `
            UPDATE tasks
            SET priority = $1
            WHERE id = $2;
        `,
        [pirority, taskId],
    );
}
