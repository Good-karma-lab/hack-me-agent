import { mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const dataDirectory = resolve(process.cwd(), "data");
const databaseFile = resolve(dataDirectory, "signaldesk.db");

rmSync(databaseFile, { force: true });
mkdirSync(dataDirectory, { recursive: true });

console.log(`Reset database at ${databaseFile}`);
