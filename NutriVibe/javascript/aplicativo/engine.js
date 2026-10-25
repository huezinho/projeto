import { foods } from "../../dados/alimentos.js";
export const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function exclusionReasons(food, profile = {}) {
  const reasons = [];
  for (const allergen of profile.restrictions || [])
    if (food.allergens.includes(allergen))
      reasons.push(`restrição: ${allergen}`);
  if ((profile.colors || []).includes(food.color))
    reasons.push(`cor: ${food.color}`);
  if ((profile.textures || []).includes(food.texture))
    reasons.push(`textura: ${food.texture}`);
  const excluded = String(profile.avoided || "")
    .split(",")
    .map(normalize)
    .filter(Boolean);
  if (excluded.some((term) => normalize(food.name).includes(term)))
    reasons.push("alimento evitado no perfil");
  return reasons;
}
export function dailyRecords(records, date) {
  return records.filter((r) => r.date === date);
}
export function recommend(records, profile, date) {
  const day = dailyRecords(records, date);
  const consumed = new Set(day.map((r) => r.foodId));
  const groups = new Set(
    day.map((r) => foods.find((f) => f.id === r.foodId)?.group).filter(Boolean),
  );
  const preferred = normalize(profile.preferred)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const ranked = foods
    .filter((f) => !consumed.has(f.id) && !exclusionReasons(f, profile).length)
    .map((food) => ({
      food,
      score:
        (!groups.has(food.group) ? 10 : 0) +
        (preferred.some((p) => normalize(food.name).includes(p)) ? 2 : 0),
      reason: !day.length
        ? "Uma opção compatível com seu perfil para começar o diário."
        : !groups.has(food.group)
          ? `${food.group} ainda não aparece nos registros deste dia. Pode ajudar a variar a próxima refeição.`
          : `Uma alternativa em ${food.group.toLowerCase()}, respeitando suas preferências.`,
    }))
    .sort(
      (a, b) =>
        b.score - a.score || a.food.name.localeCompare(b.food.name, "pt-BR"),
    );
  // Diversifica os grupos sem relaxar as restrições cadastradas.
  const selected = [];
  for (const missing of [true, false]) {
    const pool = ranked.filter(
      (item) => !groups.has(item.food.group) === missing,
    );
    const selectedGroups = new Set();
    for (const item of pool)
      if (!selectedGroups.has(item.food.group) && selected.length < 6) {
        selected.push(item);
        selectedGroups.add(item.food.group);
      }
    for (const item of pool)
      if (!selected.includes(item) && selected.length < 6) selected.push(item);
  }
  return selected;
}
