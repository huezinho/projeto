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

const animatedItems = document.querySelectorAll(".feature-card, .feature-row, .score-panel");

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    animatedItems.forEach((item) => observer.observe(item));
} else {
    animatedItems.forEach((item) => item.classList.add("is-visible"));
}

const contactForm = document.querySelector('#contato-form');
contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = contactForm.elements.nome.value.trim();
    const email = contactForm.elements.email.value.trim();
    if (!name || !email) { document.querySelector('#contato-status').textContent = 'Preencha nome e e-mail válidos.'; return; }
    document.querySelector('#contato-status').textContent = `${name}, interesse demonstrado! Seus dados não foram enviados nem salvos.`;
    contactForm.reset();
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { navLinks.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.focus(); }
});
