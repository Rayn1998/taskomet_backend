import "dotenv/config";

import dataBasePool from "@/db/db";

import Server from "@/server/server";

const server = new Server(dataBasePool, +process.env.SERVER_PORT!);

export { server };
