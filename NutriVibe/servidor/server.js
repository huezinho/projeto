import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createContactsStore } from "./contacts.js";
import { identify } from "./vision.js";
const root = fileURLToPath(new URL("../", import.meta.url));
const dataDir = process.env.NUTRIVIBE_DATA_DIR || path.join(root, ".data");
const contacts = createContactsStore({ localDirectory: dataDir });
const rates = new Map();
function json(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data));
}
async function body(req, max) {
  // O runtime Node da Vercel pode entregar JSON já processado.
  if (req.body !== undefined) {
    const raw =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(raw) > max) throw Error("Payload muito grande");
    return JSON.parse(raw);
  }
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
  ".json": "application/json",
  ".bin": "application/octet-stream",
};
export async function handler(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: blob:; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  );
  try {
    const url = new URL(req.url, "http://localhost");
    // A Vercel encaminha todas as rotas de API para uma função.
    const endpoint = req.query?.endpoint || url.searchParams.get("endpoint");
    if (endpoint) url.pathname = "/api/" + String(endpoint);
    if (url.pathname === "/api/status" && req.method === "GET")
      return json(res, 200, {
        vision: true,
        visionMode: "browser-local",
        contacts: contacts.available,
      });
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
        } catch (error) {
          return json(res, 422, {
            error:
              error.providerReason === "credits_required" ||
              error.providerReason === "account_verification_required" ||
              error.providerStatus === 402 ||
              error.providerStatus === 429
                ? "O serviço de identificação atingiu o limite de uso. Selecione o alimento manualmente."
                : "Não foi possível analisar esta foto. Confira o formato ou selecione o alimento manualmente.",
            ...(Number.isInteger(error.providerStatus)
              ? {
                  providerStatus: error.providerStatus,
                  providerReason: error.providerReason,
                }
              : {}),
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
        if (!contacts.available)
          return json(res, 503, {
            error:
              "O cadastro está temporariamente indisponível. Tente novamente mais tarde.",
          });
        try {
          await contacts.save({
            email,
            name,
            consentAt: new Date().toISOString(),
          });
        } catch {
          return json(res, 503, {
            error:
              "Não foi possível salvar seu contato. Tente novamente mais tarde.",
          });
        }
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
    if (req.method === "GET" && ["/", "/app"].includes(url.pathname)) {
      res.writeHead(307, {
        Location:
          url.pathname === "/"
            ? "/html/landingpage/index.html"
            : "/html/aplicativo/index.html",
      });
      return res.end();
    }
    const pathname = decodeURIComponent(url.pathname);
    if (
      ![
        "/html/",
        "/css/",
        "/javascript/",
        "/dados/",
        "/imagens/",
        "/modelos/",
      ].some((prefix) => pathname.startsWith(prefix))
    ) {
      res.writeHead(404);
      return res.end("Não encontrado");
    }
    const file = path.resolve(root, "." + pathname);
    if (
      !["html", "css", "javascript", "dados", "imagens", "modelos"].some(
        (dir) => file.startsWith(path.join(root, dir) + path.sep),
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
}
export { contacts };

import { pathToFileURL } from "node:url";
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const { createServer } = await import("node:http");
  const server = createServer(handler);
  server.listen(
    Number(process.env.PORT || 8080),
    process.env.HOST || "127.0.0.1",
    () =>
      console.log("NutriVibe iniciado. Porta " + (process.env.PORT || 8080)),
  );
  const stop = () =>
    server.close(() => {
      contacts.close();
      process.exit(0);
    });
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}
