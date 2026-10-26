import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { rankImage } from "../javascript/aplicativo/vision-semantic-policy.js";
const config = {
  classes: [
    { id: "0", label: "Banana", kind: "food" },
    { id: "phone", label: "Telefone", kind: "negative" },
    { id: "pizza", label: "Pizza", kind: "dish" },
  ],
  vectors: [
    [1, 0],
    [-1, 0],
    [0, 1],
  ],
  minimumScore: 0.05,
  minimumMargin: 0.01,
};
test("normalização preserva classificação e escore não é rotulado como probabilidade", () => {
  const result = rankImage(new Float32Array([2, 0]), config);
  assert.equal(result.candidates[0].foodId, "0");
  assert.equal(result.candidates[0].similarity, 1);
  assert.equal(result.candidates[0].confidence, undefined);
});
test("classe negativa e empate geram pedido manual, sem alimento forçado", () => {
  assert.deepEqual(rankImage([-1, 0], config).candidates, []);
  assert.deepEqual(rankImage([1, 1], config).candidates, []);
});
test("prato composto é identificado sem virar ingrediente do catálogo", () => {
  const c = rankImage([0, 1], config).candidates[0];
  assert.equal(c.recognizedId, "pizza");
  assert.equal(c.foodId, null);
  assert.equal(c.kind, "dish");
});
test("vetores inválidos não produzem sugestões", () => {
  assert.deepEqual(rankImage([0, 0], config).candidates, []);
  assert.deepEqual(rankImage([NaN, 0], config).candidates, []);
  assert.throws(() => rankImage([1, 0, 0], config));
});
test("artefato selecionado tem vetores e origem compatíveis com o encoder visual", () => {
  const data = JSON.parse(
    readFileSync(new URL("../dados/vision-semantic.json", import.meta.url)),
  );
  assert.equal(data.classes.length, data.vectors.length);
  assert(
    data.vectors.every((v) => v.length === 768 && v.every(Number.isFinite)),
  );
  assert.equal(
    new Set(data.classes.map((c) => c.id)).size,
    data.classes.length,
  );
  assert.match(data.model.revision, /^[a-f0-9]{40}$/);
  assert(
    data.model.files.some(
      (f) =>
        f.file === "onnx/vision_model_quantized.onnx" && f.sha256.length === 64,
    ),
  );
});
