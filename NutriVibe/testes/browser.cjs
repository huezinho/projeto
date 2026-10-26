const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const base = process.env.NUTRIVIBE_URL || "http://127.0.0.1:8090";
    const app = base + "/html/aplicativo/";
    await page.goto(app + "perfil.html");
    await page.locator("#apelido").fill("Ana");
    await page.locator("#idade").fill("12");
    await page.locator("input[value=lactose]").check();
    await page.locator("input[value=verde]").check();
    await page.getByRole("button", { name: "Salvar preferências" }).click();
    await page.getByText("Preferências salvas.", { exact: false }).waitFor();
    await page.goto(app + "registro.html");
    assert.equal(
      await page
        .getByRole("button", { name: "Registrar Brócolis", exact: true })
        .count(),
      0,
    );
    assert.equal(
      await page
        .getByRole("button", { name: "Registrar Leite", exact: true })
        .count(),
      0,
    );
    await page.locator("#busca").fill("maca");
    assert.equal(await page.locator("#catalogo article").count(), 1);
    await page.locator("#busca").fill("xyz");
    await page.locator("#catalogo .empty").waitFor();
    await page.locator("#busca").fill("");
    await page
      .getByRole("button", { name: "Registrar Banana", exact: true })
      .click();
    await page.locator("#nutrition-reference").selectOption("taco2011-182");
    await page.locator("#nutrition-grams").fill("100");
    await page
      .getByRole("button", { name: "Confirmar peso e registrar" })
      .click();
    await page.reload();
    assert.equal(await page.locator("#registros strong").count(), 1);
    await page.goto(app + "index.html");
    assert.equal(await page.locator("#recent-records strong").first().textContent(), "Banana");
    assert.equal(await page.locator("#dashboard .stat").first().textContent(), "1");
    await page.getByRole("link", { name: "Abrir diário", exact: true }).click();
    assert.equal(await page.locator("#registros strong").count(), 1);
    await page.goto(app + "resumo.html");
    assert.equal(
      await page.locator("#resumo .stat").first().textContent(),
      "1",
    );
    assert.equal(
      await page.locator("#nutrition-totals .stat").first().textContent(),
      "98,2 kcal",
    );
    const suggestions = await page.locator("#sugestoes h3").allTextContents();
    assert(!suggestions.includes("Leite"));
    assert(!suggestions.includes("Brócolis"));
    assert(!suggestions.includes("Banana"));
    await page.locator("#dia-resumo").fill("2020-01-01");
    await page.locator("#dia-resumo").dispatchEvent("change");
    assert.equal(
      await page.locator("#resumo .stat").first().textContent(),
      "0",
    );
    await page.goto(app + "registro.html");
    let paidRequests = 0;
    page.on("request", (req) => {
      if (req.url().includes("/api/identify")) paidRequests++;
    });
    const png = await page.screenshot({
      clip: { x: 0, y: 0, width: 100, height: 100 },
    });
    await page.locator("#foto").setInputFiles({
      name: "sem-alimento.png",
      mimeType: "image/png",
      buffer: png,
    });
    await page.locator("#photo-area").waitFor();
    await page.locator("#analisar").click();
    await page
      .getByText(
        "Confirme a análise local ou selecione o alimento no catálogo.",
      )
      .waitFor();
    await page.locator("#photo-consent").check();
    await page.locator("#analisar").click();
    await page.waitForFunction(
      () => !document.querySelector("#analisar").disabled,
      undefined,
      { timeout: 120000 },
    );
    assert.match(
      await page.locator("#photo-status").innerText(),
      /Não tenho segurança na identificação/,
    );
    const testImage = process.env.NUTRIVIBE_TEST_IMAGE;
    assert(
      testImage && fs.existsSync(testImage),
      "Defina NUTRIVIBE_TEST_IMAGE com uma foto de banana para teste real do modelo.",
    );
    await page.locator("#foto").setInputFiles(testImage);
    await page.locator("#photo-consent").check();
    await page.locator("#analisar").click();
    await page
      .locator('#candidatos input[value="0"]')
      .waitFor({ timeout: 120000 });
    assert.equal(await page.locator("#registros strong").count(), 1);
    await page.locator("#confirmar-foto").click();
    await page
      .getByText("Selecione ao menos um alimento", { exact: false })
      .waitFor();
    await page.locator('#candidatos input[value="0"]').check();
    await page.locator("#confirmar-foto").click();
    await page.locator("#nutrition-reference").selectOption("taco2011-182");
    await page.locator("#nutrition-grams").fill("50");
    await page
      .getByRole("button", { name: "Confirmar peso e registrar" })
      .click();
    assert.equal(await page.locator("#registros strong").count(), 2);
    await page
      .getByRole("button", { name: "Remover Banana", exact: true })
      .last()
      .click();
    assert.equal(await page.locator("#registros strong").count(), 1);
    assert.equal(
      paidRequests,
      0,
      "A foto não deve ser enviada ao endpoint pago",
    );
    if (process.env.NUTRIVIBE_TEST_DISH_IMAGE) {
      await page
        .locator("#foto")
        .setInputFiles(process.env.NUTRIVIBE_TEST_DISH_IMAGE);
      await page.locator("#photo-consent").check();
      await page.locator("#analisar").click();
      await page
        .locator('#candidatos input[value="other:pizza"]')
        .waitFor({ timeout: 120000 });
      await page.locator('#candidatos input[value="other:pizza"]').check();
      await page.locator("#confirmar-foto").click();
      await page
        .getByText("Pizza registrado sem composição presumida.", {
          exact: false,
        })
        .waitFor();
      assert(await page.locator("#nutrition-dialog").isHidden());
      await page
        .getByRole("button", { name: "Remover Pizza", exact: true })
        .click();
      assert.equal(await page.locator("#registros strong").count(), 1);
    }
    await page.locator("#custom-name").fill("Sopa de legumes");
    await page
      .getByRole("button", { name: "Registrar alimento informado" })
      .click();
    await page.getByText("Sopa de legumes", { exact: true }).waitFor();
    await page.reload();
    await page.getByText("Sopa de legumes", { exact: true }).waitFor();
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#exportar").click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    let chunks = [];
    for await (const c of stream) chunks.push(c);
    const backup = JSON.parse(Buffer.concat(chunks));
    assert.equal(backup.records.length, 2);
    await page.locator("#importar").setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from("{}"),
    });
    await page
      .getByText("Arquivo inválido. Seus dados atuais foram preservados.")
      .waitFor();
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#limpar").click();
    await page
      .getByText("Nenhum alimento registrado neste dia.", { exact: false })
      .waitFor();
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#importar").setInputFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(backup)),
    });
    await page.getByText("Sopa de legumes", { exact: true }).waitFor();

    for (const width of [360, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      for (const slug of [
        "index",
        "perfil",
        "registro",
        "resumo",
        "educacao",
      ]) {
        await page.goto(app + slug + ".html");
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${slug} overflow ${width}`,
        );
        if (width <= 860) {
          await page.locator("#menu").click();
          assert.equal(
            await page.locator("#menu").getAttribute("aria-expanded"),
            "true",
          );
          await page.keyboard.press("Escape");
        }
        for (const ref of await page
          .locator("a[href],script[src],link[href]")
          .evaluateAll((nodes) =>
            nodes.map((n) => n.getAttribute("href") || n.getAttribute("src")),
          )) {
          const u = new URL(ref, page.url());
          if (u.origin !== new URL(base).origin || u.hash) continue;
          assert((await page.request.get(u.href)).ok(), u.href);
        }
      }
      await page.goto(app + "index.html");
      await page.screenshot({
        path: `documentacoes/evidencias/visao-geral-${width}.png`,
        fullPage: true,
      });
      await page.goto(app + "resumo.html");
      await page.screenshot({
        path: `documentacoes/evidencias/recomendacoes-${width}.png`,
        fullPage: true,
      });
      await page.goto(base + "/html/landingpage/index.html");
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
    }
    // Real contact persistence API, using a dedicated test database (server started with NUTRIVIBE_DATA_DIR).
    await page.locator("#nome").fill("Teste de integração");
    await page.locator("#email").fill("integration-check@nutrivibe.invalid");
    await page.locator("#consent").check();
    await page
      .getByRole("button", { name: "Quero acompanhar o NutriVibe" })
      .click();
    await page.getByText("Interesse registrado.", { exact: false }).waitFor();
    assert.equal(
      (await page.request.get(base + "/servidor/server.js")).status(),
      404,
    );
    assert.equal(
      (await page.request.get(base + "/.data/nutrivibe.sqlite")).status(),
      404,
    );
    assert.equal(
      (
        await page.request.post(base + "/api/contacts", {
          headers: { Origin: "https://outro.site" },
          data: {},
        })
      ).status(),
      403,
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS Chromium: perfil, restrições, busca, persistência, dia, foto/fallback/consentimento/confirmação, remoção, navegação, contatos, segurança básica e 360/768/1280.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
