export const signupDraftKey = "nutrivibe-signup";
const sessionChangeKey = "nutrivibe-session-change";
let session;

export async function authRequest(endpoint, data) {
  const response = await fetch("/api/auth/" + endpoint, data === undefined ? {} : {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = new Error("Falha no acesso à conta.");
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export function getSession() {
  return session ??= authRequest("get-session");
}

export function notifySessionChange() {
  try {
    localStorage.setItem(sessionChangeKey, crypto.randomUUID());
  } catch {
    // A sessão continua disponível quando o navegador bloqueia o armazenamento local.
  }
}

export function watchSession() {
  window.addEventListener("storage", (event) => {
    if (event.key === sessionChangeKey) location.reload();
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) location.reload();
  });
}

export function readProfile(user) {
  try {
    const profile = JSON.parse(user.preferences);
    if (profile && typeof profile.name === "string" && profile.name.trim().length > 0
      && profile.name.length <= 80 && Number.isInteger(profile.age)
      && profile.age >= 1 && profile.age <= 120
      && ["restrictions", "colors", "textures"].every(key =>
        Array.isArray(profile[key]) && profile[key].every(value => typeof value === "string"))
      && typeof profile.preferred === "string" && profile.preferred.length <= 300
      && typeof profile.avoided === "string" && profile.avoided.length <= 300)
      return profile;
  } catch {
    // Contas novas ainda não têm preferências.
  }
  return null;
}
