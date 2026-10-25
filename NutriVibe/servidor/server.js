import http from "node:http";
import { readFile } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { identify } from "./vision.js";
const root = fileURLToPath(new URL("../", import.meta.url));
const dataDir = process.env.NUTRIVIBE_DATA_DIR || path.join(root, ".data");
mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, "nutrivibe.sqlite"));
db.exec(
  "CREATE TABLE IF NOT EXISTS contacts (email TEXT PRIMARY KEY, name TEXT NOT NULL, consent_at TEXT NOT NULL)",
);
const rates = new Map();
function json(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data));
}
async function body(req, max) {
  let chunks = [],
    size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > max) throw new Error("Payload muito grande");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString());
}
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};
const server = http.createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: blob:; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  );
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/api/status" && req.method === "GET")
      return json(res, 200, { vision: !!process.env.NUTRIVIBE_VISION_KEY });
    if (url.pathname.startsWith("/api/")) {
      if (req.method !== "POST")
        return json(res, 405, { error: "Método não permitido" });
      const origin = req.headers.origin;
      if (
        !origin ||
        !["http:", "https:"].includes(new URL(origin).protocol) ||
        new URL(origin).host !== req.headers.host
      )
        return json(res, 403, { error: "Origem não permitida" });
      if (!req.headers["content-type"]?.startsWith("application/json"))
        return json(res, 415, { error: "Use JSON" });
      const now = Date.now(),
        ip = req.socket.remoteAddress;
      let rate = rates.get(ip);
      if (!rate || now - rate.start > 60000) {
        rate = { start: now, count: 0 };
        rates.set(ip, rate);
      }
      if (++rate.count > 20)
        return json(res, 429, {
          error: "Muitas solicitações. Aguarde um minuto.",
        });
      // Remove janelas expiradas para limitar memória em processos longos.
      for (const [address, value] of rates)
        if (now - value.start > 60000) rates.delete(address);
      if (url.pathname === "/api/identify") {
        const input = await body(req, 5_700_000);
        if (input.consent !== true)
          return json(res, 400, {
            error: "Autorize o envio da foto antes de analisar.",
          });
        try {
          return json(res, 200, await identify(input.image));
        } catch {
          return json(res, 422, {
            error:
              "Não foi possível analisar esta foto. Confira o formato ou selecione o alimento manualmente.",
          });
        }
      }
      if (url.pathname === "/api/contacts") {
        const input = await body(req, 10000);
        const email = String(input.email || "")
            .trim()
            .toLowerCase(),
          name = String(input.name || "").trim();
        if (
          input.consent !== true ||
          !name ||
          name.length > 80 ||
          email.length > 254 ||
          !/^\S+@[^\s@]+\.[^\s@]+$/.test(email)
        )
          return json(res, 400, {
            error: "Confira nome, e-mail e consentimento.",
          });
        db.prepare(
          "INSERT INTO contacts(email,name,consent_at) VALUES(?,?,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name,consent_at=excluded.consent_at",
        ).run(email, name, new Date().toISOString());
        return json(res, 201, {
          message: "Interesse registrado. Obrigado por conhecer o NutriVibe!",
        });
      }
      return json(res, 404, { error: "Rota inexistente" });
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405);
      return res.end();
    }
    const pathname =
      url.pathname === "/"
        ? "/html/landingpage/index.html"
        : decodeURIComponent(url.pathname);
    if (
      !["/html/", "/css/", "/javascript/", "/dados/", "/imagens/"].some(
        (prefix) => pathname.startsWith(prefix),
      )
    ) {
      res.writeHead(404);
      return res.end("Não encontrado");
    }
    const file = path.resolve(root, "." + pathname);
    if (
      !["html", "css", "javascript", "dados", "imagens"].some((dir) =>
        file.startsWith(path.join(root, dir) + path.sep),
      ) ||
      !mime[path.extname(file)]
    ) {
      res.writeHead(404);
      return res.end("Não encontrado");
    }
    const content = await readFile(file);
    res.writeHead(200, {
      "Content-Type": mime[path.extname(file)],
      "Cache-Control": "no-cache",
    });
    res.end(req.method === "HEAD" ? undefined : content);
  } catch {
    if (!res.headersSent)
      json(res, 400, { error: "Solicitação inválida ou arquivo indisponível" });
    else res.end();
  }
});
server.listen(
  Number(process.env.PORT || 8080),
  process.env.HOST || "127.0.0.1",
  () => console.log("NutriVibe iniciado. Porta " + (process.env.PORT || 8080)),
);
function stop() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
