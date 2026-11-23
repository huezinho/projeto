import { getSession, readProfile, watchSession } from "./auth-client.js";

const status = document.querySelector("#session-status");

try {
  const user = (await getSession())?.user;
  if (!user) {
    const next = location.pathname + location.search + location.hash;
    location.replace("acesso.html?next=" + encodeURIComponent(next));
  } else if (!readProfile(user) && document.body.dataset.page !== "perfil") {
    location.replace("perfil.html");
  } else {
    await import("./app.js");
    watchSession();
    for (const section of document.querySelectorAll("body > header, body > main, body > footer"))
      section.hidden = false;
    status.hidden = true;
  }
} catch {
  status.textContent = "Não foi possível abrir o NutriVibe. ";
  const retry = document.createElement("a");
  retry.href = location.href;
  retry.textContent = "Tentar novamente";
  status.append(retry);
}
