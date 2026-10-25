import test from "node:test";
import assert from "node:assert/strict";
import { foods } from "../dados/alimentos.js";
import {
  recommend,
  exclusionReasons,
  dailyRecords,
} from "../javascript/aplicativo/engine.js";
import { validState } from "../javascript/aplicativo/store.js";
const date = "2026-10-25";
const record = (foodId, day = date) => ({
  id: crypto.randomUUID(),
  foodId,
  date: day,
  meal: "Almoço",
  portions: 1,
});
test("lactose, leite, glúten e seletividade excluem sugestões incompatíveis", () => {
  const profile = {
    restrictions: ["lactose", "leite", "gluten"],
    colors: ["verde"],
    textures: ["crocante"],
    avoided: "frango, ovo",
  };
  const results = recommend([record("4")], profile, date);
  assert(results.length > 0);
  for (const { food } of results)
    assert.equal(exclusionReasons(food, profile).length, 0);
  assert(
    exclusionReasons(
      foods.find((f) => f.id === "8"),
      profile,
    ).length > 0,
  );
  assert(
    exclusionReasons(
      foods.find((f) => f.id === "2"),
      profile,
    ).length > 0,
  );
  assert(
    exclusionReasons(
      foods.find((f) => f.id === "10"),
      profile,
    ).length > 0,
  );
});
test("recomendações consideram apenas o dia e priorizam grupos ausentes", () => {
  const results = recommend([record("0"), record("4", "2026-10-24")], {}, date);
  assert(!results.some((r) => r.food.id === "0"));
  assert(results.some((r) => r.food.id === "4"));
  assert(results.every((r) => r.food.group !== "Frutas"));
  assert(results.some((r) => r.food.group === "Proteínas"));
  assert.equal(
    dailyRecords([record("0"), record("4", "2026-10-24")], date).length,
    1,
  );
});
test("restrições totais produzem estado vazio e não relaxam filtros", () => {
  assert.deepEqual(
    recommend(
      [],
      {
        colors: [
          "verde",
          "vermelho",
          "amarelo",
          "laranja",
          "branco",
          "marrom",
          "bege",
        ],
      },
      date,
    ),
    [],
  );
});
test("importação rejeita registros inválidos", () => {
  assert.throws(() =>
    validState({ profile: {}, records: [record("inexistente")] }),
  );
  assert.throws(() =>
    validState({ profile: {}, records: [{ ...record("0"), portions: -1 }] }),
  );
  const r = record("0");
  assert.throws(() => validState({ profile: {}, records: [r, r] }));
  assert.equal(
    validState({ profile: { name: "Ana" }, records: [r] }).records.length,
    1,
  );
});
