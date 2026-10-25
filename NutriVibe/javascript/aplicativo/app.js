import {
  nutritionReferences,
  nutritionSource,
  nutrientLabels,
  recordNutrition,
  calculateNutrition,
  dailyNutrition,
  formatNutrient,
} from "./nutrition.js";
import { foods, restrictions } from "../../dados/alimentos.js";
import {
  normalize,
  exclusionReasons,
  dailyRecords,
  recommend,
  localDate,
} from "./engine.js";
import { load, persist, clear, validState } from "./store.js";
const $ = (s) => document.querySelector(s);
const node = (tag, text, cls) => {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  if (cls) e.className = cls;
  return e;
};
let state = { profile: {}, records: [] };
let storageBlocked = false;
try {
  state = load();
} catch {
  storageBlocked = true;
  $("#storage-status").textContent =
    "Não foi possível ler os dados salvos. Exporte uma cópia antes de alterar ou limpar o armazenamento.";
}
function save(next) {
  if (storageBlocked) return false;
  try {
    persist(next);
    state = next;
    return true;
  } catch {
    $("#storage-status").textContent =
      "Não foi possível salvar. Libere espaço ou habilite o armazenamento do navegador e tente novamente.";
    return false;
  }
}
function message(id, text) {
  $(id).textContent = text;
}
$("#menu").onclick = () => {
  const open = $("#menu").getAttribute("aria-expanded") !== "true";
  $("#menu").setAttribute("aria-expanded", open);
  $("#navegacao").classList.toggle("open", open);
};
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $("#navegacao").classList.contains("open")) {
    $("#menu").click();
    $("#menu").focus();
  }
});
$("#limpar").onclick = () => {
  if (confirm("Apagar seu perfil e todos os registros deste navegador?"))
    try {
      clear();
      location.reload();
    } catch {
      message("#global-status", "Não foi possível apagar os dados.");
    }
};
$("#exportar").onclick = () => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify({ ...state, version: 2 }, null, 2)], {
      type: "application/json",
    }),
  );
  const a = node("a");
  a.href = url;
  a.download = "nutrivibe-meus-dados.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
$("#importar-btn").onclick = () => $("#importar").click();
$("#importar").onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    if (file.size > 5_000_000) throw Error("Arquivo muito grande.");
    const incoming = validState(JSON.parse(await file.text()));
    if (
      confirm("Substituir seus dados pelos dados deste arquivo?") &&
      save(incoming)
    )
      location.reload();
  } catch {
    message(
      "#global-status",
      "Arquivo inválido. Seus dados atuais foram preservados.",
    );
  } finally {
    e.target.value = "";
  }
};
function choice(container, value, label, name) {
  const l = node("label");
  const i = node("input");
  i.type = "checkbox";
  i.name = name;
  i.value = value;
  l.append(i, document.createTextNode(label));
  $(container).append(l);
  return i;
}
if ($("#perfil-form")) {
  for (const [id, label] of Object.entries(restrictions))
    choice("#restricoes", id, label, "restrictions");
  for (const color of [
    "verde",
    "vermelho",
    "amarelo",
    "laranja",
    "branco",
    "marrom",
    "bege",
  ])
    choice("#cores", color, color, "colors");
  for (const texture of ["macio", "crocante", "cremoso", "liquido", "firme"])
    choice("#texturas", texture, texture, "textures");
  const p = state.profile;
  $("#apelido").value = p.name || "";
  $("#idade").value = p.age || "";
  $("#preferred").value = p.preferred || "";
  $("#avoided").value = p.avoided || "";
  for (const k of ["restrictions", "colors", "textures"])
    document
      .querySelectorAll(`[name=${k}]`)
      .forEach((i) => (i.checked = (p[k] || []).includes(i.value)));
  $("#perfil-form").onsubmit = (e) => {
    e.preventDefault();
    const name = $("#apelido").value.trim();
    if (!name)
      return message("#perfil-status", "Informe como deseja ser chamado.");
    const data = new FormData(e.target);
    const profile = {
      name,
      age: Number($("#idade").value),
      preferred: $("#preferred").value.trim(),
      avoided: $("#avoided").value.trim(),
    };
    for (const k of ["restrictions", "colors", "textures"])
      profile[k] = data.getAll(k);
    if (save({ ...state, profile }))
      message(
        "#perfil-status",
        "Preferências salvas. Suas próximas sugestões já considerarão estas escolhas.",
      );
  };
}
function stat(container, label, value, detail) {
  const card = node("article", undefined, "card");
  card.append(
    node("h2", label),
    node("p", String(value), "stat"),
    node("small", detail),
  );
  container.append(card);
}
function validEntry() {
  const date = $("#data"),
    amount = $("#quantidade");
  return date.reportValidity() && amount.reportValidity();
}
function addFoods(ids) {
  if (!validEntry()) return false;
  const unique = [...new Set(ids)];
  if (!unique.length) return false;
  const conflicts = unique
    .map((id) => foods.find((f) => f.id === id))
    .filter((f) => exclusionReasons(f, state.profile).length);
  if (
    conflicts.length &&
    !confirm(
      `${conflicts.map((f) => f.name).join(", ")} conflita com seu perfil. Registrar apenas como alimento já consumido? Isso não altera suas restrições.`,
    )
  )
    return false;
  const records = unique.map((foodId) => ({
    id: crypto.randomUUID(),
    foodId,
    date: $("#data").value,
    meal: $("#refeicao").value,
    portions: Number($("#quantidade").value),
  }));
  startNutrition(records);
  return true;
}
function renderRecords() {
  const list = $("#registros");
  list.replaceChildren();
  const records = dailyRecords(state.records, $("#data").value);
  if (!records.length)
    list.append(
      node(
        "li",
        "Nenhum alimento registrado neste dia. Comece pelo catálogo ou pela foto.",
        "empty",
      ),
    );
  for (const r of records) {
    const food = foods.find((f) => f.id === r.foodId) || {
      name: r.customName,
      icon: "🍽",
      allergens: [],
      color: "",
      texture: "",
    };
    const item = node("li");
    const text = node("div");
    text.append(
      node("strong", `${food.icon} ${food.name}`),
      node(
        "p",
        `${r.meal} · ${r.nutrition ? "peso confirmado" : "sem peso confirmado"}`,
        "muted",
      ),
    );
    if (exclusionReasons(food, state.profile).length)
      text.append(
        node(
          "small",
          "Este registro conflita com as preferências atuais.",
          "blocked",
        ),
      );
    const remove = node("button", "Remover", "secondary");
    remove.setAttribute("aria-label", `Remover ${food.name}`);
    remove.onclick = () => {
      if (
        save({ ...state, records: state.records.filter((x) => x.id !== r.id) })
      ) {
        renderRecords();
        message("#registro-status", `${food.name} removido.`);
        $("#busca").focus();
      }
    };
    const nutrition = recordNutrition(r);
    if (nutrition) {
      text.append(
        node(
          "p",
          `${r.nutrition.grams} g · ${nutrition.reference.description}`,
          "muted",
        ),
      );
      text.append(
        node(
          "p",
          Object.entries(nutrition.values)
            .filter(([key]) =>
              ["energyKcal", "proteinG", "carbohydrateG", "fatG"].includes(key),
            )
            .map(
              ([key, value]) =>
                `${nutrientLabels[key][0]}: ${formatNutrient(value)} ${value === null ? "" : nutrientLabels[key][1]}`,
            )
            .join(" · "),
          "food-meta",
        ),
      );
    } else
      text.append(
        node(
          "small",
          "Sem estimativa nutricional: peso e referência não confirmados.",
          "muted",
        ),
      );
    item.append(text, remove);
    list.append(item);
  }
}
function renderCatalog() {
  const list = $("#catalogo");
  list.replaceChildren();
  const filtered = foods.filter(
    (f) =>
      normalize(f.name).includes(normalize($("#busca").value)) &&
      (!$("#grupo").value || f.group === $("#grupo").value) &&
      (!$("#compativeis").checked ||
        !exclusionReasons(f, state.profile).length),
  );
  if (!filtered.length)
    list.append(
      node(
        "p",
        "Nenhum alimento encontrado com esses filtros. Ajuste a busca ou suas preferências.",
        "empty",
      ),
    );
  for (const f of filtered) {
    const card = node("article", undefined, "card");
    card.append(
      node("span", f.icon, "food-icon"),
      node("h3", f.name),
      node("span", f.group, "tag"),
      node("p", `${f.color} · ${f.texture}`, "food-meta"),
    );
    const reasons = exclusionReasons(f, state.profile);
    if (reasons.length)
      card.append(
        node("p", "Conflito com o perfil: " + reasons.join(", "), "blocked"),
      );
    const b = node("button", `Registrar ${f.name}`);
    b.onclick = () => addFoods([f.id]);
    card.append(b);
    list.append(card);
  }
}
if ($("#catalogo")) {
  $("#data").value = localDate();
  $("#data").max = localDate();
  for (const group of new Set(foods.map((f) => f.group))) {
    const o = node("option", group);
    $("#grupo").append(o);
  }
  $("#busca").oninput = renderCatalog;
  $("#grupo").onchange = renderCatalog;
  $("#compativeis").onchange = renderCatalog;
  $("#data").onchange = renderRecords;
  const params = new URLSearchParams(location.search);
  const suggested = foods.find((f) => f.id === params.get("food"));
  if (suggested) $("#busca").value = suggested.name;
  const selectedDate = params.get("date");
  if (
    selectedDate &&
    /^\d{4}-\d{2}-\d{2}$/.test(selectedDate) &&
    selectedDate <= localDate()
  )
    $("#data").value = selectedDate;
  renderCatalog();
  renderRecords();
  setupPhoto();
  $("#custom-form").onsubmit = (e) => {
    e.preventDefault();
    const name = $("#custom-name").value.trim();
    if (!name || !validEntry()) return;
    const record = {
      id: crypto.randomUUID(),
      foodId: null,
      customName: name,
      date: $("#data").value,
      meal: $("#refeicao").value,
      portions: Number($("#quantidade").value),
    };
    if (save({ ...state, records: [...state.records, record] })) {
      renderRecords();
      e.target.reset();
      message(
        "#registro-status",
        "Alimento informado registrado. Confira ingredientes e restrições diretamente no preparo ou rótulo.",
      );
    }
  };
}
function updateSummary() {
  const date = $("#dia-resumo").value;
  if (!date) return;
  renderNutritionSummary(date);
  const day = dailyRecords(state.records, date);
  const groups = new Map();
  for (const r of day) {
    const f = foods.find((f) => f.id === r.foodId);
    if (f) groups.set(f.group, (groups.get(f.group) || 0) + 1);
  }
  $("#resumo").replaceChildren();
  stat(
    $("#resumo"),
    "Alimentos registrados",
    day.length,
    "Entradas no diário deste dia",
  );
  stat(
    $("#resumo"),
    "Alimentos diferentes",
    new Set(day.map((r) => r.foodId || r.customName)).size,
    "Variedade nos registros",
  );
  stat(
    $("#resumo"),
    "Grupos presentes",
    groups.size,
    "Sem avaliação de adequação",
  );
  $("#grupos-resumo").replaceChildren();
  for (const [group, count] of groups) {
    const row = node("div", undefined, "group-row");
    const meter = node("meter");
    meter.min = 0;
    meter.max = day.length;
    meter.value = count;
    meter.setAttribute(
      "aria-label",
      `${group}: ${count} de ${day.length} registros`,
    );
    row.append(
      node("span", group),
      meter,
      node("small", `${count} registro(s)`),
    );
    $("#grupos-resumo").append(row);
  }
  if (!day.length)
    $("#grupos-resumo").append(
      node("p", "Este dia ainda não tem registros.", "empty"),
    );
  message(
    "#suggestion-context",
    day.length
      ? "Opções compatíveis com seu perfil. Grupos ainda não registrados aparecem primeiro."
      : "Ainda não há refeições neste dia. As opções abaixo consideram somente seu perfil.",
  );
  const list = $("#sugestoes");
  list.replaceChildren();
  const suggestions = recommend(state.records, state.profile, date);
  if (!suggestions.length)
    list.append(
      node(
        "p",
        "Nenhuma opção disponível com as preferências atuais. Revise o perfil ou converse com um nutricionista para encontrar alternativas.",
        "empty",
      ),
    );
  for (const { food, reason } of suggestions) {
    const card = node("article", undefined, "card");
    card.append(
      node("span", food.icon, "food-icon"),
      node("h3", food.name),
      node("span", food.group, "tag"),
      node("p", reason),
      node(
        "small",
        `Destaque do alimento: ${food.highlights.join(", ")}. Confira ingredientes e preparo.`,
      ),
    );
    const a = node("a", "Adicionar ao diário →");
    a.href = `registro.html?food=${encodeURIComponent(food.id)}&date=${encodeURIComponent(date)}`;
    card.append(a);
    list.append(card);
  }
}
if ($("#resumo")) {
  $("#dia-resumo").value = localDate();
  $("#dia-resumo").onchange = updateSummary;
  updateSummary();
}
if ($("#dashboard")) {
  const day = dailyRecords(state.records, localDate());
  stat(
    $("#dashboard"),
    "Registros de hoje",
    day.length,
    "Cada descoberta tem seu lugar",
  );
  stat(
    $("#dashboard"),
    "Grupos no dia",
    new Set(
      day
        .map((r) => foods.find((f) => f.id === r.foodId)?.group)
        .filter(Boolean),
    ).size,
    "Acompanhe a variedade",
  );
  stat(
    $("#dashboard"),
    "Seu perfil",
    state.profile.name || "Vamos começar?",
    "Preferências respeitadas nas sugestões",
  );
}
function setupPhoto() {
  let image = "",
    version = 0;
  const candidates = $("#candidatos");
  function reset() {
    version++;
    image = "";
    $("#foto").value = "";
    $("#photo-area").hidden = true;
    $("#preview").removeAttribute("src");
    candidates.replaceChildren();
    $("#confirmar-foto").hidden = true;
    $("#photo-consent").checked = false;
    $("#analisar").disabled = false;
    message("#photo-status", "");
  }
  $("#descartar").onclick = reset;
  $("#foto").onchange = async (e) => {
    const file = e.target.files[0];
    reset();
    if (!file) return;
    if (
      file.size > 12_000_000 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      return message(
        "#registro-status",
        "Use uma imagem JPEG, PNG ou WebP de até 12 MB.",
      );
    const current = version;
    try {
      const bitmap = await createImageBitmap(file);
      const ratio = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * ratio);
      canvas.height = Math.round(bitmap.height * ratio);
      canvas
        .getContext("2d")
        .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      if (current !== version) return;
      image = canvas.toDataURL("image/jpeg", 0.82);
      $("#preview").src = image;
      $("#photo-area").hidden = false;
      message(
        "#photo-status",
        "Foto pronta. Você pode analisar ou selecionar o alimento no catálogo.",
      );
    } catch {
      message(
        "#registro-status",
        "Não foi possível abrir esta imagem. Tente outra foto.",
      );
    }
  };
  $("#analisar").onclick = async () => {
    if (!image) return;
    if (!$("#photo-consent").checked)
      return message(
        "#photo-status",
        "Confirme a análise local ou selecione o alimento no catálogo.",
      );
    const current = version;
    $("#analisar").disabled = true;
    candidates.replaceChildren();
    $("#confirmar-foto").hidden = true;
    message("#photo-status", "Analisando a imagem…");
    try {
      const { classifyLocal } = await import("../vendor/free-vision.js");
      if (current !== version) return;
      const result = await classifyLocal($("#preview"), (text) => {
        if (current === version) message("#photo-status", text);
      });
      if (current !== version) return;
      message("#photo-status", result.message);
      for (const c of result.candidates || []) {
        const f = foods.find((f) => f.id === c.foodId);
        if (f) choice("#candidatos", f.id, f.name, "candidate");
      }
      $("#confirmar-foto").hidden = !candidates.children.length;
    } catch (error) {
      if (current === version)
        message(
          "#photo-status",
          `${error.name === "AbortError" ? "A análise demorou mais que o esperado." : error.message} Qual alimento aparece na foto? Selecione no catálogo.`,
        );
    } finally {
      if (current === version) $("#analisar").disabled = false;
    }
  };
  $("#confirmar-foto").onclick = () => {
    const ids = [...candidates.querySelectorAll("input:checked")].map(
      (i) => i.value,
    );
    if (!ids.length)
      return message(
        "#photo-status",
        "Selecione ao menos um alimento ou corrija a identificação no catálogo.",
      );
    if (addFoods(ids)) reset();
  };
}

// A identificação nunca escolhe preparo nem peso: ambos são confirmados nesta etapa.
let nutritionQueue = [];
let nutritionPosition = 0;
function startNutrition(records) {
  nutritionQueue = records;
  nutritionPosition = 0;
  showNutritionStep();
  $("#nutrition-dialog").showModal();
}
function showNutritionStep() {
  const record = nutritionQueue[nutritionPosition];
  const food = foods.find((f) => f.id === record.foodId);
  message(
    "#nutrition-food",
    `${food.name} · item ${nutritionPosition + 1} de ${nutritionQueue.length}`,
  );
  const select = $("#nutrition-reference");
  select.replaceChildren(node("option", "Selecione a variedade e o preparo"));
  select.firstChild.value = "";
  for (const ref of nutritionReferences.filter(
    (r) => r.foodId === record.foodId,
  )) {
    const option = node("option", ref.description);
    option.value = ref.id;
    select.append(option);
  }
  $("#nutrition-grams").value = "";
  $("#nutrition-preview").replaceChildren();
}
function nutritionPreview() {
  const record = nutritionQueue[nutritionPosition];
  const preview = $("#nutrition-preview");
  preview.replaceChildren();
  if (
    !$("#nutrition-reference").value ||
    !$("#nutrition-grams").checkValidity()
  )
    return;
  try {
    const result = calculateNutrition(
      record.foodId,
      $("#nutrition-reference").value,
      Number($("#nutrition-grams").value),
    );
    for (const [key, value] of Object.entries(result.values))
      preview.append(
        node(
          "p",
          `${nutrientLabels[key][0]}: ${formatNutrient(value)} ${value === null ? "" : nutrientLabels[key][1]}`,
        ),
      );
  } catch {
    preview.append(node("p", "Confira o peso e a referência."));
  }
}
function finishNutritionStep(withEstimate) {
  const record = nutritionQueue[nutritionPosition];
  if (!withEstimate) delete record.nutrition;
  if (withEstimate) {
    if (!$("#nutrition-form").reportValidity()) return;
    record.nutrition = {
      referenceId: $("#nutrition-reference").value,
      grams: Number($("#nutrition-grams").value),
      sourceId: nutritionSource.id,
    };
  }
  nutritionPosition++;
  if (nutritionPosition < nutritionQueue.length) return showNutritionStep();
  if (save({ ...state, records: [...state.records, ...nutritionQueue] })) {
    $("#nutrition-dialog").close();
    renderRecords();
    message(
      "#registro-status",
      `${nutritionQueue.length} alimento(s) registrado(s).`,
    );
    nutritionQueue = [];
  } else nutritionPosition--; // permite tentar salvar novamente após corrigir o armazenamento.
}
if ($("#nutrition-form")) {
  $("#nutrition-reference").onchange = nutritionPreview;
  $("#nutrition-grams").oninput = nutritionPreview;
  $("#nutrition-form").onsubmit = (event) => {
    event.preventDefault();
    finishNutritionStep(true);
  };
  $("#nutrition-skip").onclick = () => finishNutritionStep(false);
  $("#nutrition-cancel").onclick = () => {
    $("#nutrition-dialog").close();
    nutritionQueue = [];
  };
  $("#nutrition-dialog").addEventListener("cancel", () => {
    nutritionQueue = [];
  });
}
function renderNutritionSummary(date) {
  const result = dailyNutrition(state.records, date);
  const list = $("#nutrition-totals");
  if (!list) return;
  list.replaceChildren();
  message(
    "#nutrition-coverage",
    `${result.calculated} de ${result.records} registros com referência e peso confirmados. ${result.missing} sem estimativa.`,
  );
  for (const [key, [label, unit]] of Object.entries(nutrientLabels)) {
    const partial = result.coverage[key] < result.records;
    stat(
      list,
      label,
      `${formatNutrient(result.totals[key])}${result.totals[key] === null ? "" : " " + unit}`,
      `${result.coverage[key]} de ${result.records} registros com valor informado${partial ? " · subtotal parcial" : ""}`,
    );
  }
}
