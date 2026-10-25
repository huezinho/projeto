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
  if (!save({ ...state, records: [...state.records, ...records] }))
    return false;
  renderRecords();
  message("#registro-status", `${records.length} alimento(s) registrado(s).`);
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
      node("p", `${r.meal} · ${r.portions} porção(ões)`, "muted"),
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
    version = 0,
    controller;
  const candidates = $("#candidatos");
  function reset() {
    version++;
    controller?.abort();
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
        "Autorize o envio da foto ou selecione o alimento no catálogo.",
      );
    const current = version;
    controller = new AbortController();
    const requestController = controller;
    const timeout = setTimeout(() => requestController.abort(), 30000);
    $("#analisar").disabled = true;
    candidates.replaceChildren();
    $("#confirmar-foto").hidden = true;
    message("#photo-status", "Analisando a imagem…");
    try {
      const response = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, consent: true }),
        signal: requestController.signal,
      });
      const result = await response.json();
      if (current !== version) return;
      if (!response.ok)
        throw Error(result.error || "Não foi possível analisar.");
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
      clearTimeout(timeout);
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
