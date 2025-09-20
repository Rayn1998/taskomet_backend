import dataBasePool from "@/db/db";

import ITask from "@shared/types/Task";

export async function getTasks(
    projectId: string,
    sceneId: string,
): Promise<ITask[]> {
    return (
        await dataBasePool.query(
            `
        SELECT 
            t.id,
            t.name,
            t.type,
            t.status,
            t.executor,
            t.priority,
            t.description,
            t.project,
            t.scene,
            p.name AS project_name,
            s.name AS scene_name,
            SUM(td.spent_hours) AS spent_hours
        FROM tasks t
        LEFT JOIN task_data td ON t.id = td.task_id
        JOIN projects p ON t.project = p.id
        JOIN scenes s ON t.scene = s.id
        WHERE LOWER(p.name) = LOWER($1)
        AND LOWER(s.name) = LOWER($2)
        GROUP BY 
            t.id, t.name, t.type, t.status, t.executor, t.priority, t.description, t.project, t.scene,
            p.name, s.name
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
): Promise<ITask> {
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

export async function deleteTask(id: number): Promise<ITask> {
    return (
        await dataBasePool.query(
            `
        DELETE FROM tasks
        WHERE id = $1
        RETURNING *;
    `,
            [id],
        )
    ).rows[0];
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
