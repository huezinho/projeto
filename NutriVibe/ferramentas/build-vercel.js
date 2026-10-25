import "./prepare-free-vision.js";
import { mkdir, cp, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../../", import.meta.url));
const source = path.join(root, "NutriVibe");
const output = path.join(root, "public");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const directory of [
  "html",
  "css",
  "javascript",
  "dados",
  "imagens",
  "modelos",
])
  await cp(path.join(source, directory), path.join(output, directory), {
    recursive: true,
  });
// Não publica documentos, banco, código de servidor ou segredos.
await writeFile(
  path.join(output, "index.html"),
  '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>NutriVibe</title></head><body><a href="/html/landingpage/index.html">Conhecer NutriVibe</a><a href="/html/aplicativo/index.html">Abrir aplicativo</a></body></html>',
);
console.log("Arquivos públicos do NutriVibe preparados.");
