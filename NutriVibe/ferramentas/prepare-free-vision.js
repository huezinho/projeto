import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { build } from "esbuild";
const root = fileURLToPath(new URL("../../", import.meta.url));
const modelDir = path.join(root, "NutriVibe/modelos/mobilenet");
const base =
  "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/";
await mkdir(modelDir, { recursive: true });
async function asset(name) {
  if (!/^[a-zA-Z0-9_.-]+$/.test(name)) throw Error("Nome de artefato inválido");
  const dest = path.join(modelDir, name);
  try {
    const b = await readFile(dest);
    if (b.length) return b;
  } catch {}
  const response = await fetch(base + name, {
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok)
    throw Error(`Falha ao obter modelo oficial (${response.status})`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(dest, bytes);
  return bytes;
}
const manifest = JSON.parse(await asset("model.json"));
const hashes = {};
for (const group of manifest.weightsManifest)
  for (const name of group.paths) {
    const bytes = await asset(name);
    hashes[name] = createHash("sha256").update(bytes).digest("hex");
  }
hashes["model.json"] = createHash("sha256")
  .update(await readFile(path.join(modelDir, "model.json")))
  .digest("hex");
const expected = JSON.parse(
  await readFile(
    path.join(root, "NutriVibe/dados/modelo-local-integridade.json"),
    "utf8",
  ),
);
for (const [name, hash] of Object.entries(hashes))
  if (expected.hashes[name] !== hash)
    throw Error(`Integridade do modelo divergente: ${name}`);
await writeFile(
  path.join(modelDir, "provenance.json"),
  JSON.stringify(
    { source: base, model: "MobileNet V1 1.0 224 ImageNet", hashes },
    null,
    2,
  ),
);
await mkdir(path.join(root, "NutriVibe/javascript/vendor"), {
  recursive: true,
});
await build({
  entryPoints: [
    path.join(root, "NutriVibe/javascript/aplicativo/vision-local-entry.js"),
  ],
  outfile: path.join(root, "NutriVibe/javascript/vendor/free-vision.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  minify: true,
  legalComments: "eof",
  target: "es2022",
});
console.log("Modelo e API gratuita preparados.");
