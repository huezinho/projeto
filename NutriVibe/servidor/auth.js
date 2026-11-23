import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db/migration";
import pg from "pg";
import { readProfile } from "../javascript/aplicativo/auth-client.js";

const vercel = process.env.VERCEL === "1";
const productionHosts = [
  "nutrivibe-gamma.vercel.app",
  "nutrivibe-mast-care.vercel.app",
  process.env.VERCEL_URL,
].filter(Boolean);
const endpoints = new Map([
  ["get-session", "GET"],
  ["sign-up/email", "POST"],
  ["sign-in/email", "POST"],
  ["update-user", "POST"],
  ["sign-out", "POST"],
]);
let initialization;

async function initialize(dataDir) {
  const connection = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  const secret = process.env.BETTER_AUTH_SECRET
    || (!vercel && "nutrivibe-local-development-secret-not-for-production");
  if (!secret || (vercel && !connection)) throw Error("Auth configuration missing");
  let database;
  if (connection) {
    database = new pg.Pool({
      connectionString: connection,
      max: 3,
      connectionTimeoutMillis: 8000,
      idleTimeoutMillis: 5000,
    });
    database.on("error", () => console.error("Conexão inativa do NutriVibe encerrada."));
  } else {
    mkdirSync(dataDir, { recursive: true });
    database = new DatabaseSync(path.join(dataDir, "nutrivibe-auth.sqlite"));
  }
  const options = {
    database,
    secret,
    baseURL: {
      allowedHosts: vercel ? productionHosts : ["localhost:*", "127.0.0.1:*"],
      protocol: vercel ? "https" : "http",
    },
    emailAndPassword: { enabled: true, minPasswordLength: 8, maxPasswordLength: 128 },
    advanced: { cookiePrefix: "nutrivibe", useSecureCookies: vercel },
    user: {
      modelName: "nutrivibe_auth_user",
      additionalFields: { preferences: { type: "string", required: false } },
    },
    session: { modelName: "nutrivibe_auth_session" },
    account: { modelName: "nutrivibe_auth_account" },
    verification: { modelName: "nutrivibe_auth_verification" },
    rateLimit: {
      enabled: true,
      storage: "database",
      modelName: "nutrivibe_auth_rate_limit",
      customRules: {
        "/get-session": false,
        "/sign-in/email": { window: 60, max: 8 },
        "/sign-up/email": { window: 60, max: 8 },
      },
    },
  };
  const migrate = async () => (await getMigrations(options)).runMigrations();
  try {
    if (connection) {
      const client = await database.connect();
      try {
        await client.query("BEGIN");
        await client.query("SELECT pg_advisory_xact_lock(817200679)");
        await migrate();
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
      } finally {
        client.release();
      }
    } else await migrate();
    return betterAuth(options);
  } catch (error) {
    if (connection) await database.end();
    else database.close();
    throw error;
  }
}

export async function authResponse(req, endpoint, dataDir, readBody) {
  const method = endpoints.get(endpoint);
  if (!method) return Response.json({ error: "Rota inexistente" }, { status: 404 });
  if (method !== req.method)
    return Response.json({ error: "Método não permitido" }, { status: 405 });

  const host = req.headers.host;
  const validHost = vercel ? productionHosts.includes(host)
    : /^(localhost|127\.0\.0\.1):\d+$/.test(host);
  if (!validHost) return Response.json({ error: "Origem não permitida" }, { status: 403 });
  const origin = (vercel ? "https://" : "http://") + host;
  let body;
  if (method === "POST") {
    if (req.headers.origin !== origin)
      return Response.json({ error: "Origem não permitida" }, { status: 403 });
    if (!req.headers["content-type"]?.startsWith("application/json"))
      return Response.json({ error: "Use JSON" }, { status: 415 });
    body = await readBody(req, 12_000);
    if (!body || typeof body !== "object" || Array.isArray(body))
      return Response.json({ error: "Solicitação inválida" }, { status: 400 });
    if (endpoint === "sign-up/email") {
      const { name, email, password } = body;
      if (typeof name !== "string" || !name.trim() || name.trim().length > 80
        || typeof email !== "string" || email.trim().length > 254 || typeof password !== "string")
        return Response.json({ error: "Confira os dados da conta" }, { status: 400 });
      body = { name: name.trim(), email: email.trim().toLowerCase(), password };
    }
    if (endpoint === "update-user") {
      if (typeof body.preferences !== "string" || body.preferences.length > 4096 || !readProfile(body))
        return Response.json({ error: "Preferências inválidas" }, { status: 400 });
      body = { preferences: body.preferences };
    }
  }

  try {
    initialization ??= initialize(dataDir).catch((error) => {
      initialization = undefined;
      throw error;
    });
    const auth = await initialization;
    const headers = new Headers({ host });
    for (const name of ["cookie", "origin", "content-type", "user-agent", "sec-fetch-site"])
      if (req.headers[name]) headers.set(name, req.headers[name]);
    const address = vercel ? req.headers["x-vercel-forwarded-for"] || req.socket.remoteAddress
      : req.socket.remoteAddress;
    if (address) headers.set("x-forwarded-for", address);
    const result = await auth.handler(new Request(origin + "/api/auth/" + endpoint, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body),
    }));
    if (!result.ok) return result;

    const responseHeaders = new Headers();
    for (const cookie of result.headers.getSetCookie()) responseHeaders.append("Set-Cookie", cookie);
    if (endpoint === "get-session") {
      const payload = await result.json();
      // A sessão fica no cookie HttpOnly. O aplicativo só precisa do perfil.
      return Response.json(payload?.user ? {
        user: {
          id: payload.user.id,
          name: payload.user.name,
          preferences: payload.user.preferences,
        },
      } : null, { headers: responseHeaders });
    }
    return Response.json({ success: true }, { headers: responseHeaders });
  } catch (error) {
    console.error("Autenticação indisponível", error.code || error.name);
    return Response.json({ error: "Acesso temporariamente indisponível." }, { status: 503 });
  }
}
