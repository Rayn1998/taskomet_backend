import dataBasePool from "@/db/db";

export async function getAll() {
    const result = await dataBasePool.query(`SELECT * FROM artist`);
    return result.rows;
}
