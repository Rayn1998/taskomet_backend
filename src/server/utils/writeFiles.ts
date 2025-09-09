import { join } from "path";
import { mkdir, access } from "fs/promises";
import { PathLike } from "fs";

const now = new Date();
const CURRENT_DATE = `${now.getDate()}_${
    now.getMonth() + 1
}_${now.getFullYear()}`;

const UPLOADS_FOLDER_PATH = join(__dirname, "../../../uploads");
const CURRENT_DATE_PATH = join(UPLOADS_FOLDER_PATH, CURRENT_DATE);

export async function checkFolders(): Promise<string> {
    if (!(await checkFolder(UPLOADS_FOLDER_PATH)))
        await mkdir(UPLOADS_FOLDER_PATH);
    if (!(await checkFolder(CURRENT_DATE_PATH))) await mkdir(CURRENT_DATE_PATH);
    return CURRENT_DATE_PATH;
}

async function checkFolder(path: PathLike) {
    try {
        await access(path);
        return true;
    } catch (err) {
        return false;
    }
}
