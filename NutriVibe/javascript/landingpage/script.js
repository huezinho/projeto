const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#menu-principal");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

const animatedItems = document.querySelectorAll(
  ".feature-card, .feature-row, .score-panel",
);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  animatedItems.forEach((item) => observer.observe(item));
} else {
  animatedItems.forEach((item) => item.classList.add("is-visible"));
}

const contactForm = document.querySelector("#contato-form");
contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.querySelector("#contato-status");
  const name = contactForm.elements.nome.value.trim(),
    email = contactForm.elements.email.value.trim();
  if (!name) {
    status.textContent = "Informe seu nome.";
    return;
  }
  const button = contactForm.querySelector("button");
  button.disabled = true;
  status.textContent = "Registrando seu interesse…";
  try {
    const response = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        consent: document.querySelector("#consent").checked,
      }),
    });
    const result = await response.json();
    if (!response.ok) throw Error(result.error);
    status.textContent = result.message;
    contactForm.reset();
  } catch {
    status.textContent =
      "Não foi possível registrar seu interesse. Tente novamente quando o serviço estiver disponível.";
  } finally {
    button.disabled = false;
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navLinks.classList.contains("is-open")) {
    navLinks.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.focus();
  }
});
