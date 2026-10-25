import test from "node:test";
import assert from "node:assert/strict";
import { identify, validateImage } from "../servidor/vision.js";
const image =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
test("imagem inválida é rejeitada", () => {
  assert.throws(() => validateImage("data:image/png;base64,Zm9v"));
  assert.throws(() => validateImage("https://example.com/a.png"));
});
test("sem credencial solicita identificação manual", async () => {
  const result = await identify(image, { key: "" });
  assert.equal(result.available, false);
  assert.deepEqual(result.candidates, []);
});
test("resposta externa: baixa confiança, duplicatas e IDs desconhecidos são descartados", async () => {
  const fetchImpl = async (url, options) => {
    assert.equal(url, "https://api.openai.com/v1/chat/completions");
    assert(JSON.parse(options.body).response_format.json_schema.strict);
    return {
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                candidates: [
                  { foodId: "0", confidence: 0.9 },
                  { foodId: "0", confidence: 0.95 },
                  { foodId: "1", confidence: 0.2 },
                  { foodId: "999", confidence: 0.9 },
                ],
              }),
            },
          },
        ],
      }),
    };
  };
  const result = await identify(image, { key: "test-only", fetchImpl });
  assert.deepEqual(result.candidates, [{ foodId: "0", confidence: 0.9 }]);
});
test("erro do provedor é propagado sem expor segredos", async () => {
  await assert.rejects(
    identify(image, {
      key: "test-only",
      fetchImpl: async () => ({ ok: false }),
    }),
    /serviço/,
  );
});
test("Gateway Vercel usa rota OpenAI compatível e preserva modelo OpenAI", async () => {
  let body;
  await identify(image, {
    key: "test-only",
    provider: "vercel-gateway",
    fetchImpl: async (url, options) => {
      assert.equal(url, "https://ai-gateway.vercel.sh/v1/chat/completions");
      body = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '{"candidates":[]}' } }],
        }),
      };
    },
  });
  assert.equal(body.model, "openai/gpt-4o-mini");
});
