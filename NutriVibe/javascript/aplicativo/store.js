import { foods } from "../../dados/alimentos.js";
const KEY = "nutrivibe-v2";
export function validState(s) {
  if (
    !s ||
    !s.profile ||
    typeof s.profile !== "object" ||
    Array.isArray(s.profile) ||
    !Array.isArray(s.records) ||
    s.records.length > 10000
  )
    throw Error("Arquivo de dados inválido.");
  const p = s.profile;
  for (const k of ["name", "preferred", "avoided"])
    if (p[k] !== undefined && (typeof p[k] !== "string" || p[k].length > 300))
      throw Error("Perfil inválido.");
  for (const k of ["restrictions", "colors", "textures"])
    if (
      p[k] !== undefined &&
      (!Array.isArray(p[k]) || p[k].some((v) => typeof v !== "string"))
    )
      throw Error("Preferências inválidas.");
  const ids = new Set();
  for (const r of s.records) {
    if (
      !r ||
      typeof r.id !== "string" ||
      ids.has(r.id) ||
      !(
        foods.some((f) => f.id === r.foodId) ||
        (r.foodId === null &&
          typeof r.customName === "string" &&
          r.customName.trim().length > 0 &&
          r.customName.length <= 80)
      ) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(r.date) ||
      !Number.isFinite(new Date(r.date).valueOf()) ||
      typeof r.meal !== "string" ||
      r.meal.length > 80 ||
      !Number.isFinite(r.portions) ||
      r.portions < 0.25 ||
      r.portions > 20
    )
      throw Error("Registros inválidos.");
    ids.add(r.id);
  }
  return { profile: s.profile, records: s.records };
}
export function load() {
  const raw = localStorage.getItem(KEY);
  if (raw) return validState(JSON.parse(raw));
  const old = JSON.parse(localStorage.getItem("nutrivibe-mvp-v1") || "null");
  if (old) {
    return validState({
      profile: {
        name: old.perfil?.apelido || "",
        age: old.perfil?.idade || "",
        preferred: old.perfil?.preferencias || "",
        avoided: old.perfil?.recusas || "",
      },
      records: (old.registros || [])
        .filter((r) => foods.some((f) => f.id === r.alimento))
        .map((r) => ({
          id: r.id,
          foodId: r.alimento,
          date: r.data,
          meal: r.refeicao,
          portions: 1,
        })),
    });
  }
  return { profile: {}, records: [] };
}
export function persist(state) {
  localStorage.setItem(KEY, JSON.stringify(validState(state)));
}
export function clear() {
  localStorage.removeItem(KEY);
  localStorage.removeItem("nutrivibe-mvp-v1");
}
