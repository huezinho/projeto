import { authRequest, getSession, notifySessionChange, readProfile, signupDraftKey, watchSession } from "./auth-client.js";

const identityForm = document.querySelector("#identity-form");
const passwordForm = document.querySelector("#password-form");
const signinForm = document.querySelector("#signin-form");
const title = document.querySelector("#account-title");
const status = document.querySelector("#account-status");
const toggle = document.querySelector("#account-mode");
const params = new URLSearchParams(location.search);
const candidate = params.get("next") || "";
const next = /^\/html\/aplicativo\/(index|perfil|registro|resumo|educacao)\.html(?:[?#]|$)/.test(candidate)
  ? candidate : "index.html";

function show(form, focus = false) {
  for (const item of [identityForm, passwordForm, signinForm]) item.hidden = item !== form;
  status.textContent = "";
  title.textContent = form === signinForm ? "Entre no NutriVibe"
    : form === passwordForm ? "Crie sua senha" : "Crie sua conta";
  toggle.textContent = form === signinForm ? "Quero criar uma conta" : "Já tenho uma conta";
  if (focus) form.querySelector("input").focus();
}

function beginPassword(focus) {
  const name = identityForm.elements.name.value.trim();
  if (!name) {
    status.textContent = "Informe seu nome.";
    identityForm.elements.name.focus();
    return;
  }
  document.querySelector("#signup-identity").textContent =
    name + " · " + identityForm.elements.email.value.trim();
  show(passwordForm, focus);
}

function signupDraft() {
  try {
    return JSON.parse(sessionStorage.getItem(signupDraftKey));
  } catch {
    return null;
  }
}

const draft = signupDraft();
if (draft) {
  identityForm.elements.name.value = draft.name || "";
  identityForm.elements.email.value = draft.email || "";
}
if (params.get("modo") === "entrar") show(signinForm);
else if (draft && identityForm.checkValidity()) beginPassword(false);

identityForm.onsubmit = event => {
  event.preventDefault();
  beginPassword(true);
};
document.querySelector("#edit-identity").onclick = () => {
  passwordForm.reset();
  show(identityForm, true);
};
toggle.onclick = () => {
  passwordForm.reset();
  if (signinForm.hidden) {
    signinForm.elements.email.value = identityForm.elements.email.value;
    show(signinForm, true);
  } else {
    signinForm.reset();
    show(identityForm, true);
  }
};

async function authenticate(form, endpoint, data, redirect) {
  const controls = [...document.querySelectorAll("form input, form button, #account-mode")];
  for (const control of controls) control.disabled = true;
  status.textContent = "Aguarde…";
  try {
    await authRequest(endpoint, data);
    try { sessionStorage.removeItem(signupDraftKey); } catch {}
    notifySessionChange();
    location.replace(redirect);
  } catch (error) {
    status.textContent = error.status === 429
      ? "Muitas tentativas. Aguarde um minuto e tente novamente."
      : error.status >= 500 || !error.status
        ? "O acesso está temporariamente indisponível. Tente novamente."
        : form === signinForm
          ? "Confira o e-mail e a senha e tente novamente."
          : "Não foi possível criar a conta. Confira os dados ou entre se já tiver cadastro.";
    for (const control of controls) control.disabled = false;
  }
}

passwordForm.onsubmit = event => {
  event.preventDefault();
  const password = passwordForm.elements.password.value;
  if (password !== document.querySelector("#confirm-password").value) {
    status.textContent = "As senhas precisam ser iguais.";
    document.querySelector("#confirm-password").focus();
    return;
  }
  void authenticate(passwordForm, "sign-up/email", {
    name: identityForm.elements.name.value.trim(),
    email: identityForm.elements.email.value.trim(),
    password,
  }, "perfil.html");
};

signinForm.onsubmit = event => {
  event.preventDefault();
  void authenticate(signinForm, "sign-in/email", {
    email: signinForm.elements.email.value.trim().toLowerCase(),
    password: signinForm.elements.password.value,
  }, next);
};

watchSession();
try {
  const user = (await getSession())?.user;
  if (user) location.replace(readProfile(user) ? next : "perfil.html");
} catch {
  status.textContent = "O acesso está temporariamente indisponível. Tente novamente.";
}
