import { Pool, DatabaseError } from 'pg';
import { dbData } from '@/constant';

const dataBasePool = new Pool(dbData);

async function checkDbConnection() {
    try {
        const client = await dataBasePool.connect();
        if (client) {
            console.log("Connection to db established");
        }
        client.release();
    } catch (err) {
        if (err instanceof DatabaseError) {
            if (err.code === '28P01') {
                console.log("Incorrect password to db");
            }
        }
        process.exit(1);
    }
}

(async () => await checkDbConnection())();
export default dataBasePool;