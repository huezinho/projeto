import * as tf from "@tensorflow/tfjs";
import { load } from "@tensorflow-models/mobilenet";
import { selectFood } from "./vision-labels.js";
let modelPromise;
export async function classifyLocal(image, onProgress = () => {}) {
  if (!modelPromise) {
    onProgress(
      "Carregando reconhecimento gratuito. Na primeira análise, o download pode demorar.",
    );
    modelPromise = (async () => {
      await tf.setBackend("cpu");
      await tf.ready();
      return load({
        version: 2,
        alpha: 0.5,
        modelUrl: "/modelos/mobilenet/model.json",
        inputRange: [0, 1],
      });
    })().catch((error) => {
      modelPromise = undefined;
      throw error;
    });
  }
  const model = await modelPromise;
  onProgress("Analisando no seu aparelho…");
  const predictions = await model.classify(image, 3);
  const candidates = selectFood(predictions);
  return {
    available: true,
    candidates,
    message: candidates.length
      ? "Confira o alimento sugerido. O reconhecimento local não confirma ingredientes nem quantidade."
      : "Não consegui reconhecer com segurança. Qual alimento aparece na foto? Selecione no catálogo ou informe o nome.",
  };
}
