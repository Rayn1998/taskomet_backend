import dataBasePool from "@/db/db";
import { updateStatus } from "./tasks.service";

import type { ITaskData, TaskDataMin } from "@shared/types/EntityData";

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

export async function addComment(newTaskData: ITaskData): Promise<ITaskData> {
    const {
        type,
        task_id,
        text,
        media,
        created_at,
        created_by,
        status,
        spent_hours,
    } = newTaskData;
    if (media) {
        await dataBasePool.query("BEGIN");
        await updateStatus(task_id, status);
        const res = (
            await dataBasePool.query(
                `
                    INSERT INTO task_data (type, task_id, text, media, created_by, created_at, status, spent_hours)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *;
                    `,
                [
                    type,
                    task_id,
                    text,
                    media,
                    created_by,
                    created_at,
                    status,
                    spent_hours,
                ],
            )
        ).rows[0];
        await dataBasePool.query("COMMIT");

        return res;
    } else {
        await dataBasePool.query("BEGIN");
        await updateStatus(task_id, status);
        const res = (
            await dataBasePool.query(
                `
                    INSERT INTO task_data (type, task_id, text, created_by, created_at, status, spent_hours)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING *;
                    `,
                [
                    type,
                    task_id,
                    text,
                    created_by,
                    created_at,
                    status,
                    spent_hours,
                ],
            )
        ).rows[0];
        await dataBasePool.query("COMMIT");

        return res;
    }
}

export async function deleteComment(commentId: number): Promise<ITaskData> {
    return (
        await dataBasePool.query(
            `
        DELETE FROM task_data
        WHERE id = $1
        RETURNING *;
        `,
            [commentId],
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
