/* Dados de demonstração. Nenhum dado sai deste navegador. */
const KEY = 'nutrivibe-mvp-v1';
let state = { perfil: null, registros: [] };
const storageStatus = document.querySelector('#storage-status');
try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && Array.isArray(saved.registros)) {
        state.perfil = saved.perfil && typeof saved.perfil.apelido === 'string' ? saved.perfil : null;
        state.registros = saved.registros.filter(r => r && typeof r.id === 'string' && ALIMENTOS.some(a => a.id === r.alimento) && typeof r.data === 'string' && typeof r.refeicao === 'string');
    }
} catch { storageStatus.textContent = 'Não foi possível ler os dados locais. Você pode continuar com dados temporários.'; }
function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch { storageStatus.textContent = 'Armazenamento indisponível: alterações disponíveis apenas até sair desta página.'; return false; }
}
function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
}
const menu = document.querySelector('#menu');
const nav = document.querySelector('#navegacao');
menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open);
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.focus();
    }
});
document.querySelector('#limpar').addEventListener('click', () => {
    if (!confirm('Apagar perfil e registros fictícios deste navegador?')) return;
    state = { perfil: null, registros: [] };
    try { localStorage.removeItem(KEY); }
    catch { storageStatus.textContent = 'Não foi possível apagar o armazenamento. Verifique as permissões do navegador.'; return; }
    location.reload();
});
const profileForm = document.querySelector('#perfil-form');
if (profileForm) {
    if (state.perfil) for (const key of ['apelido','idade','preferencias','recusas']) profileForm.elements[key].value = state.perfil[key] || '';
    profileForm.addEventListener('submit', event => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(profileForm));
        values.apelido = values.apelido.trim();
        if (!values.apelido) { document.querySelector('#perfil-status').textContent = 'Informe um apelido válido.'; return; }
        state.perfil = values;
        document.querySelector('#perfil-status').textContent = save() ? 'Perfil salvo neste navegador. Continue para o registro.' : 'Perfil temporário: não foi possível salvar.';
    });
}
const catalog = document.querySelector('#catalogo');
function renderRecords() {
    const list = document.querySelector('#registros'); list.replaceChildren();
    if (!state.registros.length) list.append(el('li', 'Nenhum alimento registrado. Explore o catálogo para começar.'));
    for (const record of state.registros) {
        const food = ALIMENTOS.find(a => a.id === record.alimento);
        const item = el('li'); item.append(el('span', `${food.nome} · ${record.refeicao} · ${record.data}`));
        const remove = el('button','Remover','secondary'); remove.setAttribute('aria-label',`Remover ${food.nome} de ${record.refeicao} em ${record.data}`);
        remove.addEventListener('click', () => {
            state.registros = state.registros.filter(r => r.id !== record.id); save(); renderRecords();
            document.querySelector('#registro-status').textContent = `${food.nome} removido.`;
            document.querySelector('#busca').focus();
        });
        item.append(remove); list.append(item);
    }
}
function renderCatalog() {
    const query = document.querySelector('#busca').value.trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const group = document.querySelector('#grupo').value;
    const foods = ALIMENTOS.filter(a => (!group || a.grupo === group) && a.nome.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(query));
    catalog.replaceChildren();
    if (!foods.length) catalog.append(el('p','Nenhum resultado. Tente outro nome ou grupo.'));
    for (const food of foods) {
        const card = el('article',undefined,'card');
        card.append(el('span',food.icone,'food-icon'),el('h3',food.nome),el('p',food.grupo));
        const button = el('button',`Registrar ${food.nome}`);
        button.addEventListener('click', () => {
            const date = document.querySelector('#data');
            if (!date.reportValidity()) return;
            state.registros.push({id:crypto.randomUUID(),alimento:food.id,refeicao:document.querySelector('#refeicao').value,data:date.value});
            const persisted = save(); renderRecords();
            document.querySelector('#registro-status').textContent = `${food.nome} registrado${persisted ? ' neste navegador' : ' temporariamente'}.`;
        });
        card.append(button); catalog.append(card);
    }
}
if (catalog) {
    const now = new Date();
    document.querySelector('#data').value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    document.querySelector('#busca').addEventListener('input',renderCatalog);
    document.querySelector('#grupo').addEventListener('change',renderCatalog);
    renderCatalog(); renderRecords();
}
const summary = document.querySelector('#resumo');
if (summary) {
    const unique = new Set(state.registros.map(r => r.alimento));
    const groups = new Map();
    state.registros.forEach(r => { const group = ALIMENTOS.find(a => a.id === r.alimento).grupo; groups.set(group,(groups.get(group)||0)+1); });
    for (const [label,value] of [['Registros',state.registros.length],['Alimentos diferentes',unique.size],['Grupos presentes',groups.size]]) {
        const card = el('article',undefined,'card'); card.append(el('h2',label),el('p',String(value),'stat')); summary.append(card);
    }
    const list = document.querySelector('#grupos-resumo');
    for (const [group,count] of groups) {
        const item = el('li',`${group}: ${count} registro(s) `); const meter = el('meter'); meter.min=0; meter.max=state.registros.length; meter.value=count; meter.setAttribute('aria-label',`${group}: ${count} de ${state.registros.length}`); item.append(meter); list.append(item);
    }
    if (!groups.size) list.append(el('li','Ainda não há registros. Comece pelo diário.'));
    document.querySelector('#sugestao').textContent = groups.size ? 'Observe as cores e formas dos alimentos registrados. Que histórias vocês podem contar sobre eles? Explore sem pressão e respeite as preferências.' : 'Comece registrando um alimento que você já conhece. Depois, explore os conteúdos educativos com um responsável.';
}
