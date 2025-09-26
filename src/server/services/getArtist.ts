import dataBasePool from "@/db/db";
import IArtist from "@shared/types/Artist";

export async function getArtist(
    user_name: string,
): Promise<IArtist | undefined> {
    return (
        await dataBasePool.query("SELECT * FROM artist WHERE user_name = $1;", [
            user_name,
        ])
    ).rows[0];
}
