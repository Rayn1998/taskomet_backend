import dataBasePool from "@/db/db";

export async function getAll(projectId: string, sceneId: string) {
    return (
        await dataBasePool.query(
            `
        SELECT t.*, p.name AS project_nane, s.name AS scene_name, a.name AS executor_name
        FROM tasks t
        JOIN projects p ON t.project = p.id
        JOIN scenes s ON t.scene = s.id
        LEFT JOIN artist a ON t.executor = a.id
        WHERE LOWER(p.name) = $1
        AND LOWER(s.name) = $2;
    `,
            [projectId, sceneId],
        )
    ).rows;
}
