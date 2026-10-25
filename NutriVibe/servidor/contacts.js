import path from "node:path";
import { mkdirSync } from "node:fs";
const SCHEMA =
  "CREATE TABLE IF NOT EXISTS contacts (email TEXT PRIMARY KEY, name TEXT NOT NULL, consent_at TEXT NOT NULL)";
export function createContactsStore({
  cloud = !!process.env.VERCEL,
  connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL,
  localDirectory,
  postgresFactory,
} = {}) {
  let local, sqlPromise;
  async function postgres() {
    if (!sqlPromise)
      sqlPromise = (async () => {
        if (postgresFactory) return postgresFactory(connectionString);
        const { neon } = await import("@neondatabase/serverless");
        return neon(connectionString);
      })().catch((error) => {
        sqlPromise = undefined;
        throw error;
      });
    return sqlPromise;
  }
  return {
    available: !!connectionString || !cloud,
    async save({ email, name, consentAt }) {
      if (connectionString) {
        const sql = await postgres();
        // Transação atômica; schema idempotente, sem depender de disco efêmero.
        await sql.transaction(
          [
            sql.query(SCHEMA),
            sql.query(
              "INSERT INTO contacts(email,name,consent_at) VALUES($1,$2,$3) ON CONFLICT(email) DO UPDATE SET name=excluded.name,consent_at=excluded.consent_at",
              [email, name, consentAt],
            ),
          ],
          { fetchOptions: { signal: AbortSignal.timeout(15000) } },
        );
        return;
      }
      if (cloud) throw Error("Persistent storage not configured");
      if (!local) {
        mkdirSync(localDirectory, { recursive: true });
        const { DatabaseSync } = await import("node:sqlite");
        local = new DatabaseSync(path.join(localDirectory, "nutrivibe.sqlite"));
        local.exec(SCHEMA);
      }
      local
        .prepare(
          "INSERT INTO contacts(email,name,consent_at) VALUES(?,?,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name,consent_at=excluded.consent_at",
        )
        .run(email, name, consentAt);
    },
    close() {
      local?.close();
    },
  };
}
