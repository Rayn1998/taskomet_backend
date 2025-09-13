import dataBasePool from "@/db/db";
import ITaskData, { TaskDataMin } from "@shared/types/TaskData";

export async function getTaskData(taskId: number): Promise<ITaskData[]> {
    return (
        await dataBasePool.query(
            `
        SELECT td.*
        FROM task_data td
        JOIN tasks t ON td.task_id = t.id
        WHERE td.task_id = $1;
        `,
            [taskId],
        )
    ).rows;
}

export async function addDailies(newTaskData: ITaskData): Promise<ITaskData> {
    const { type, task_id, text, media, created_at, created_by } = newTaskData;
    return (
        await dataBasePool.query(
            `
            INSERT INTO task_data (type, task_id, text, media, created_by, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
            `,
            [type, task_id, text, media, created_by, created_at],
        )
    ).rows[0];
}

export async function addUpdateStatus(
    newTaskData: TaskDataMin,
): Promise<ITaskData> {
    const { type, task_id, created_at, created_by, status, spent_hours } =
        newTaskData;

    return (
        await dataBasePool.query(
            `
            INSERT INTO task_data (type, task_id, created_at, created_by, status, spent_hours)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `,
            [type, task_id, created_at, created_by, status, spent_hours],
        )
    ).rows[0];
}
