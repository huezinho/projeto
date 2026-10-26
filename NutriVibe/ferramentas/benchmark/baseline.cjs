const fs = require("node:fs");
const { chromium } = require("playwright");
(async () => {
  await require("esbuild").build({
    entryPoints: ["NutriVibe/ferramentas/benchmark/mobilenet-entry.js"],
    outfile: "NutriVibe/javascript/vendor/mobilenet-benchmark.js",
    bundle: true,
    format: "esm",
    platform: "browser",
    minify: true,
  });
  const dir = "/tmp/nutrivibe-benchmark";
  const data = JSON.parse(
    fs.readFileSync("NutriVibe/documentacoes/avaliacao-imagens/dataset.json"),
  );
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.goto("http://127.0.0.1:8096/html/aplicativo/registro.html");
    let rows = [];
    for (const p of data.photos) {
      const buffer = fs.readFileSync(dir + "/photos/" + p.id);
      const encoded = "data:image/jpeg;base64," + buffer.toString("base64");
      const start = Date.now();
      const result = await page.evaluate(async (url) => {
        const img = new Image();
        img.src = url;
        await img.decode();
        const { classifyLocal } =
          await import("/javascript/vendor/mobilenet-benchmark.js");
        return classifyLocal(img);
      }, encoded);
      const predicted = result.candidates[0]?.foodId || "none";
      rows.push({
        photo: p.id,
        expected: p.expected,
        scope: p.scope,
        split: p.split,
        prediction: predicted,
        correct:
          predicted === p.expected ||
          (p.scope === "ood" && predicted === "none"),
        abstained: predicted === "none",
        predictions: result.predictions,
        timeSeconds: (Date.now() - start) / 1000,
      });
      if (rows.length % 10 === 0)
        console.log("MobileNet", rows.length, "/", data.photos.length);
      fs.writeFileSync(
        "NutriVibe/documentacoes/avaliacao-imagens/mobilenet-results.json",
        JSON.stringify({ model: "mobilenet-v1", rows }, null, 2),
      );
    }
    console.log("MobileNet concluído.");
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
