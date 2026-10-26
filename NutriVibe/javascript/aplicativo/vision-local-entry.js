import * as ort from "onnxruntime-web/wasm";
import config from "../../dados/vision-semantic.json";
import { rankImage } from "./vision-semantic-policy.js";
let sessionPromise;
const weights = config.model.files.find(
  (f) => f.file === "onnx/vision_model_quantized.onnx",
);
const modelUrl =
  "/modelos/siglip/vision-" + weights.sha256.slice(0, 12) + ".onnx";
async function downloadModel(progress) {
  const response = await fetch(modelUrl, { cache: "force-cache" });
  if (!response.ok)
    throw Error(
      "Não foi possível carregar o reconhecimento. Tente novamente ou use o catálogo.",
    );
  const bytes = new Uint8Array(weights.bytes);
  let length = 0;
  if (!response.body) {
    const array = new Uint8Array(await response.arrayBuffer());
    if (array.length !== weights.bytes)
      throw Error("Download do modelo incompleto.");
    bytes.set(array);
    length = array.length;
  } else {
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (length + value.length > weights.bytes) {
        await reader.cancel();
        throw Error("Tamanho do modelo divergente.");
      }
      bytes.set(value, length);
      length += value.length;
      progress(
        `Carregando modelo: ${Math.round(length / 1e6)} de ${Math.round(weights.bytes / 1e6)} MB. A foto permanece no aparelho.`,
      );
    }
  }
  if (length !== weights.bytes)
    throw Error("Download do modelo incompleto. Tente novamente.");
  // A verificação estática do build é complementada pela verificação do arquivo recebido.
  const hash = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
  if (hash !== weights.sha256)
    throw Error(
      "Integridade do modelo inválida. Use o catálogo e tente novamente depois.",
    );
  return bytes.buffer;
}
export async function classifyLocal(image, onProgress = () => {}) {
  if (!sessionPromise)
    sessionPromise = (async () => {
      onProgress(
        "Preparando reconhecimento. O primeiro uso baixa aproximadamente 112 MB; a foto não é enviada.",
      );
      ort.env.wasm.wasmPaths = "/modelos/ort/1.24.3/";
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.proxy = false;
      return ort.InferenceSession.create(await downloadModel(onProgress), {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      });
    })().catch((error) => {
      sessionPromise = undefined;
      throw error;
    });
  const session = await sessionPromise;
  if (
    image instanceof HTMLImageElement &&
    (!image.complete || !image.naturalWidth)
  )
    await image.decode();
  onProgress("Analisando o alimento ou prato principal no seu aparelho…");
  const canvas = document.createElement("canvas");
  canvas.width = 224;
  canvas.height = 224;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, 224, 224);
  const pixels = context.getImageData(0, 0, 224, 224).data,
    values = new Float32Array(3 * 224 * 224),
    size = 224 * 224;
  for (let i = 0; i < size; i++)
    for (let channel = 0; channel < 3; channel++)
      values[channel * size + i] = pixels[i * 4 + channel] / 127.5 - 1;
  const input = new ort.Tensor("float32", values, [1, 3, 224, 224]);
  let outputs;
  try {
    outputs = await session.run({ pixel_values: input }, ["pooler_output"]);
    const result = rankImage(outputs.pooler_output.data, config);
    return {
      available: true,
      ...result,
      message: !result.candidates.length
        ? "Não tenho segurança na identificação. Qual alimento aparece na foto? Selecione no catálogo ou informe o nome."
        : result.candidates[0].kind === "dish"
          ? "Confira o prato identificado. A foto não confirma seus ingredientes; registre-os separadamente para calcular nutrientes."
          : result.candidates[0].tentative
            ? "Esta é uma possibilidade, não uma confirmação. Confira ou corrija o alimento antes de registrar."
            : "Confira o alimento sugerido e confirme o preparo e o peso antes de registrar.",
    };
  } finally {
    input.dispose();
    if (outputs) for (const tensor of Object.values(outputs)) tensor.dispose();
  }
}
