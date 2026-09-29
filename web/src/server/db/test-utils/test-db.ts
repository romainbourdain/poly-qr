import { sql } from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres, { type Sql } from "postgres";
import * as schema from "@/server/db/schema";
import { env } from "@/server/env";

const connectionString = env.DATABASE_URL_TEST;

if (!connectionString) {
  throw new Error("DATABASE_URL_TEST n'est pas défini");
}

export type TestDb = PostgresJsDatabase<typeof schema>;

/**
 * Ouvre une connexion à la base de test et applique les migrations.
 * À appeler une fois avant la suite (ex. `beforeAll`).
 */
export async function creerTestDb(): Promise<{ db: TestDb; client: Sql }> {
  const client = postgres(connectionString as string, { max: 1 });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "./src/server/db/migrations" });
  return { db, client };
}

/**
 * Vide toutes les tables métier entre deux tests, sans redescendre le schéma.
 */
export async function nettoyerTestDb(db: TestDb): Promise<void> {
  await db.execute(
    sql`TRUNCATE TABLE billets, commandes, evenements RESTART IDENTITY CASCADE`,
  );
}

export async function fermerTestDb(client: Sql): Promise<void> {
  await client.end();
}
