import { dataBasePool } from '../../app';

export async function getAll(projectId: string, sceneId: string) {
    return (
        await dataBasePool.query(
            `
        SELECT t.*, p.name AS project_nane, s.name AS scene_name
        FROM tasks t
        JOIN projects p ON t.project = p.id
        JOIN scenes s ON t.scene = s.id
        WHERE LOWER(p.name) = $1
        AND LOWER(s.name) = $2;
    `,
            [projectId, sceneId]
        )
    ).rows;
}
