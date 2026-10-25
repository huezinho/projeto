import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateNutrition,
  dailyNutrition,
  nutritionReferences,
  nutritionSource,
} from "../javascript/aplicativo/nutrition.js";
import { validState } from "../javascript/aplicativo/store.js";
const record = (id, referenceId, grams, date = "2026-10-25") => ({
  id: crypto.randomUUID(),
  foodId: id,
  date,
  meal: "Almoço",
  portions: 1,
  nutrition: { referenceId, grams, sourceId: nutritionSource.id },
});
test("arroz cozido: 150 g proporcional à planilha original e preparo integral distinto", () => {
  const result = calculateNutrition("4", "taco2011-3", 150);
  assert(Math.abs(result.values.energyKcal - 192.387729) < 0.000001);
  assert(Math.abs(result.values.proteinG - 3.7812255) < 0.000001);
  assert.notEqual(
    result.values.energyKcal,
    calculateNutrition("4", "taco2011-1", 150).values.energyKcal,
  );
});
test("rejeita peso inválido e referência de alimento diferente", () => {
  for (const grams of [0, -1, NaN, Infinity, 5001])
    assert.throws(() => calculateNutrition("4", "taco2011-3", grams));
  assert.throws(() => calculateNutrition("0", "taco2011-3", 100));
  assert.throws(() =>
    validState({ profile: {}, records: [record("0", "taco2011-3", 100)] }),
  );
});
test("subtotal diário não transforma ausências ou registros antigos em zero", () => {
  const first = record("4", "taco2011-3", 100);
  const second = record("4", "taco2011-3", 50);
  const old = {
    id: "old",
    foodId: "0",
    date: first.date,
    meal: "Lanche",
    portions: 1,
  };
  const result = dailyNutrition(
    [first, second, old, record("4", "taco2011-3", 100, "2026-10-24")],
    first.date,
  );
  assert.equal(result.records, 3);
  assert.equal(result.calculated, 2);
  assert.equal(result.missing, 1);
  assert.equal(result.coverage.energyKcal, 2);
  assert(Math.abs(result.totals.energyKcal - 192.387729) < 0.000001);
  const empty = dailyNutrition([old], old.date);
  assert.equal(empty.totals.energyKcal, null);
});
test("referências têm proveniência, IDs únicos e ausências preservadas", () => {
  assert.equal(nutritionReferences.length, 43);
  assert.equal(new Set(nutritionReferences.map((r) => r.id)).size, 43);
  assert.equal(nutritionSource.sha256.length, 64);
  const missing = nutritionReferences.find((r) =>
    Object.values(r.nutrients).some((v) => v === null),
  );
  assert(missing);
  for (const [key, value] of Object.entries(missing.nutrients))
    if (value === null)
      assert.equal(
        calculateNutrition(missing.foodId, missing.id, 100).values[key],
        null,
      );
});
