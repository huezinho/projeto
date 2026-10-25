import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createContactsStore } from "../servidor/contacts.js";
import { handler } from "../servidor/server.js";
const contact = {
  email: "deploy-test@example.com",
  name: "Teste",
  consentAt: "2026-10-25T12:00:00Z",
};
test("Vercel sem PostgreSQL não usa armazenamento efêmero", async () => {
  const store = createContactsStore({
    cloud: true,
    connectionString: undefined,
  });
  assert.equal(store.available, false);
  await assert.rejects(store.save(contact));
});
test("PostgreSQL recebe transação parametrizada e schema idempotente", async () => {
  let queries;
  const store = createContactsStore({
    cloud: true,
    connectionString: "postgresql://test-only",
    postgresFactory: () => ({
      query: (text, params) => ({ text, params }),
      transaction: async (q) => {
        queries = q;
      },
    }),
  });
  await store.save(contact);
  assert.equal(queries.length, 2);
  assert.match(queries[0].text, /CREATE TABLE IF NOT EXISTS/);
  assert.match(queries[1].text, /VALUES\(\$1,\$2,\$3\)/);
  assert.deepEqual(queries[1].params, [
    contact.email,
    contact.name,
    contact.consentAt,
  ]);
});
test("SQLite continua persistente no modo local", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "nutrivibe-deploy-"));
  const store = createContactsStore({
    cloud: false,
    connectionString: undefined,
    localDirectory: directory,
  });
  try {
    await store.save(contact);
    await store.save({ ...contact, name: "Atualizado" });
    const { DatabaseSync } = await import("node:sqlite");
    const db = new DatabaseSync(path.join(directory, "nutrivibe.sqlite"));
    assert.equal(db.prepare("SELECT count(*) n FROM contacts").get().n, 1);
    assert.equal(
      db.prepare("SELECT name FROM contacts").get().name,
      "Atualizado",
    );
    db.close();
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
async function request(req) {
  req.socket = { remoteAddress: "127.0.0.1" };
  let status, output;
  const res = {
    headersSent: false,
    setHeader() {},
    writeHead(s) {
      status = s;
      this.headersSent = true;
    },
    end(body) {
      output = body;
    },
  };
  await handler(req, res);
  return { status, data: JSON.parse(output) };
}
test("handler aceita rota reescrita e body pré-processado da Vercel", async () => {
  const status = await request({
    method: "GET",
    url: "/api/index?endpoint=status",
    headers: {},
  });
  assert.equal(status.status, 200);
  assert.equal(typeof status.data.contacts, "boolean");
  const result = await request({
    method: "POST",
    url: "/api/index?endpoint=identify",
    headers: {
      host: "nutrivibe.vercel.app",
      origin: "https://nutrivibe.vercel.app",
      "content-type": "application/json",
    },
    body: { consent: false },
  });
  assert.equal(result.status, 400);
  assert.match(result.data.error, /Autorize/);
  const forbidden = await request({
    method: "POST",
    url: "/api/index?endpoint=contacts",
    headers: {
      host: "nutrivibe.vercel.app",
      origin: "https://outro.site",
      "content-type": "application/json",
    },
    body: {},
  });
  assert.equal(forbidden.status, 403);
});
