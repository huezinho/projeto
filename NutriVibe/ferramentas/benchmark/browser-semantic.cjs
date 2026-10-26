const fs = require("node:fs");
const { chromium } = require("playwright");
(async () => {
  const report = "NutriVibe/documentacoes/avaliacao-imagens/";
  const initial = JSON.parse(fs.readFileSync(report + "dataset.json"));
  const fresh = JSON.parse(fs.readFileSync(report + "validation-dataset.json"));
  const photos = [...initial.photos, ...fresh.photos];
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.error("JS", e.message));
    await page.goto("http://127.0.0.1:8097/html/aplicativo/registro.html");
    const rows = [];
    for (const p of photos) {
      const url =
        "data:image/jpeg;base64," +
        fs
          .readFileSync("/tmp/nutrivibe-benchmark/photos/" + p.id)
          .toString("base64");
      const start = Date.now();
      const result = await page.evaluate(async (data) => {
        const raw = new Image();
        raw.src = data;
        await raw.decode();
        const canvas = document.createElement("canvas");
        const ratio = Math.min(
          1,
          1280 / Math.max(raw.naturalWidth, raw.naturalHeight),
        );
        canvas.width = Math.round(raw.naturalWidth * ratio);
        canvas.height = Math.round(raw.naturalHeight * ratio);
        canvas
          .getContext("2d")
          .drawImage(raw, 0, 0, canvas.width, canvas.height);
        const image = new Image();
        image.src = canvas.toDataURL("image/jpeg", 0.82);
        await image.decode();
        const { classifyLocal } =
          await import("/javascript/vendor/free-vision.js");
        const result = await classifyLocal(image);
        return {
          candidates: result.candidates,
          ranking: result.ranking.slice(0, 5),
          margin: result.margin,
        };
      }, url);
      const prediction = result.ranking[0]?.id || "none";
      const accepted = result.candidates[0]?.recognizedId || "none";
      const truths = p.acceptable || [p.expected];
      const correct =
        truths.includes(prediction) ||
        (p.expected === "negative" && prediction.startsWith("negative"));
      rows.push({
        photo: p.id,
        expected: p.expected,
        acceptable: p.acceptable,
        scope: p.scope,
        split: p.split,
        prediction,
        correct,
        accepted,
        acceptedCorrect: accepted !== "none" && truths.includes(accepted),
        ...result,
        timeSeconds: (Date.now() - start) / 1000,
      });
      if (rows.length % 15 === 0)
        console.log("SigLIP browser", rows.length, "/", photos.length);
      fs.writeFileSync(
        report + "siglip-browser-results.json",
        JSON.stringify(
          {
            model: "siglip-quantized-browser",
            policy: { minimumMargin: 0.01, minimumScore: 0.05 },
            rows,
          },
          null,
          2,
        ),
      );
    }
    console.log("SigLIP browser concluído.");
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
