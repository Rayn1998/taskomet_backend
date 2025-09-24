import "dotenv/config";
import { Pool, DatabaseError } from "pg";
import { dbData } from "@/constant";

const dataBasePool = new Pool({ ...dbData, database: process.env.DB_NAME });

let reconnectTimer: NodeJS.Timeout | null = null;

async function checkDbConnection() {
    try {
        const client = await dataBasePool.connect();
        client.release();
        console.log("Connection to db established");

        if (reconnectTimer) {
            clearInterval(reconnectTimer);
            reconnectTimer = null;
            console.log("🛑 Reconnect timer stopped");
        }
    } catch (err) {
        if (err instanceof DatabaseError) {
            if (err.code === "28P01") {
                console.log("Incorrect password to db");
            }
        }

        console.log("Can't connect to db, will try again...");

        if (!reconnectTimer) {
            reconnectTimer = setInterval(checkDbConnection, 10 * 1000);
            console.log("⏳ Started reconnect attempts every 10s...");
        }
    }
}
(async () => await checkDbConnection())();
export default dataBasePool;
