import dataBasePool from "@/db/db"

export async function getTaskData(taskId: number) {
    return (
        await dataBasePool.query(`
        SELECT td.*
        FROM task_data td
        JOIN tasks t ON td.task_id = t.id
        WHERE td.task_id = $1;
        `,[taskId])
    ).rows;
}