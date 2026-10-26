import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { build } from "esbuild";
const root = fileURLToPath(new URL("../../", import.meta.url));
const config = JSON.parse(
  await readFile(
    path.join(root, "NutriVibe/dados/vision-semantic.json"),
    "utf8",
  ),
);
const file = config.model.files.find(
  (f) => f.file === "onnx/vision_model_quantized.onnx",
);
export async function prepareSemanticVision(output) {
  const cache = path.join(root, "NutriVibe/modelos/siglip");
  await mkdir(cache, { recursive: true });
  const dest = path.join(cache, "vision-" + file.sha256.slice(0, 12) + ".onnx");
  let bytes;
  try {
    bytes = await readFile(dest);
  } catch {
    try {
      bytes = await readFile(path.join(cache, "vision_model_quantized.onnx"));
    } catch {}
  }
  if (!bytes) {
    const url = `https://huggingface.co/${config.model.repo}/resolve/${config.model.revision}/${file.file}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(180000) });
    if (!response.ok) throw Error("Falha no modelo SigLIP: " + response.status);
    bytes = Buffer.from(await response.arrayBuffer());
  }
  if (
    bytes.length !== file.bytes ||
    createHash("sha256").update(bytes).digest("hex") !== file.sha256
  )
    throw Error("Hash do encoder visual divergente.");
  await writeFile(dest, bytes);
  const modelOut = path.join(output, "modelos/siglip");
  await mkdir(modelOut, { recursive: true });
  await writeFile(path.join(modelOut, path.basename(dest)), bytes);
  const ortDir = path.join(output, "modelos/ort/1.24.3");
  await mkdir(ortDir, { recursive: true });
  const ortCache = path.join(root, "NutriVibe/modelos/ort/1.24.3");
  await mkdir(ortCache, { recursive: true });
  for (const name of [
    "ort-wasm-simd-threaded.mjs",
    "ort-wasm-simd-threaded.wasm",
  ]) {
    await copyFile(
      path.join(root, "node_modules/onnxruntime-web/dist", name),
      path.join(ortDir, name),
    );
    await copyFile(
      path.join(root, "node_modules/onnxruntime-web/dist", name),
      path.join(ortCache, name),
    );
  }
  const vendor = path.join(root, "NutriVibe/javascript/vendor");
  await mkdir(vendor, { recursive: true });
  await build({
    entryPoints: [
      path.join(root, "NutriVibe/javascript/aplicativo/vision-local-entry.js"),
    ],
    outfile: path.join(vendor, "free-vision.js"),
    bundle: true,
    platform: "browser",
    format: "esm",
    target: "es2022",
    minify: true,
    legalComments: "eof",
    conditions: ["onnxruntime-web-use-extern-wasm"],
  });
  await mkdir(path.join(output, "javascript/vendor"), { recursive: true });
  await copyFile(
    path.join(vendor, "free-vision.js"),
    path.join(output, "javascript/vendor/free-vision.js"),
  );
  console.log("Encoder SigLIP e vetores de rótulos preparados e verificados.");
}
