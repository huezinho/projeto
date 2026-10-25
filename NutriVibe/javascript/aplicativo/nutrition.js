import { nutritionReferences, nutritionSource } from "../../dados/nutricao.js";
export { nutritionReferences, nutritionSource };
export const nutrientLabels = {
  energyKcal: ["Energia", "kcal"],
  proteinG: ["Proteínas", "g"],
  carbohydrateG: ["Carboidratos", "g"],
  fatG: ["Gorduras", "g"],
  fiberG: ["Fibras", "g"],
  calciumMg: ["Cálcio", "mg"],
  ironMg: ["Ferro", "mg"],
  sodiumMg: ["Sódio", "mg"],
};
export function calculateNutrition(foodId, referenceId, grams) {
  const reference = nutritionReferences.find(
    (r) => r.id === referenceId && r.foodId === foodId,
  );
  if (!reference || !Number.isFinite(grams) || grams <= 0 || grams > 5000)
    throw Error("Confirme a referência e um peso entre 0 e 5000 g.");
  return {
    reference,
    values: Object.fromEntries(
      Object.entries(reference.nutrients).map(([key, value]) => [
        key,
        value === null ? null : (value * grams) / reference.basisGrams,
      ]),
    ),
  };
}
export function recordNutrition(record) {
  if (!record.nutrition) return null;
  try {
    return calculateNutrition(
      record.foodId,
      record.nutrition.referenceId,
      record.nutrition.grams,
    );
  } catch {
    return null;
  }
}
export function dailyNutrition(records, date) {
  const day = records.filter((r) => r.date === date);
  const result = {
    records: day.length,
    calculated: 0,
    missing: 0,
    totals: {},
    coverage: {},
  };
  for (const key of Object.keys(nutrientLabels)) {
    result.totals[key] = null;
    result.coverage[key] = 0;
  }
  for (const record of day) {
    const calculated = recordNutrition(record);
    if (!calculated) {
      result.missing++;
      continue;
    }
    result.calculated++;
    for (const [key, value] of Object.entries(calculated.values))
      if (value !== null) {
        result.totals[key] = (result.totals[key] ?? 0) + value;
        result.coverage[key]++;
      }
  }
  return result;
}
export const formatNutrient = (value) =>
  value === null
    ? "Não informado"
    : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(
        value,
      );
