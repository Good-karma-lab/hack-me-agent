import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { schema } from "./schema";

const databasePath = resolve(process.cwd(), "data", "signaldesk.db");
mkdirSync(dirname(databasePath), { recursive: true });

const databaseUrl = process.env.DATABASE_URL ?? `file:${databasePath}`;

const client = createClient({
  url: databaseUrl,
});

export const db = drizzle(client, { schema });

let ensurePromise: Promise<void> | null = null;

export function ensureDatabase() {
  if (!ensurePromise) {
    ensurePromise = initializeDatabase();
  }

  return ensurePromise;
}

async function initializeDatabase() {
  await client.execute("PRAGMA foreign_keys = ON");

  await client.batch(
    [
      `
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY NOT NULL,
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS organizations (
          id TEXT PRIMARY KEY NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS memberships (
          id TEXT PRIMARY KEY NOT NULL,
          user_id TEXT NOT NULL,
          organization_id TEXT NOT NULL,
          role TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY(organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
          UNIQUE(user_id, organization_id)
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY NOT NULL,
          user_id TEXT NOT NULL,
          expires_at INTEGER NOT NULL,
          created_at INTEGER NOT NULL,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS inboxes (
          id TEXT PRIMARY KEY NOT NULL,
          organization_id TEXT NOT NULL,
          name TEXT NOT NULL,
          channel TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          FOREIGN KEY(organization_id) REFERENCES organizations(id) ON DELETE CASCADE
        )
      `,
      `CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users(email)`,
      `CREATE UNIQUE INDEX IF NOT EXISTS organizations_slug_idx ON organizations(slug)`,
      `CREATE UNIQUE INDEX IF NOT EXISTS memberships_user_org_idx ON memberships(user_id, organization_id)`,
    ].map((statement) => ({ sql: statement })),
    "write",
  );
}
