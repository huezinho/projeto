import * as tf from "@tensorflow/tfjs";
import { IMAGENET_CLASSES } from "@tensorflow-models/mobilenet/dist/imagenet_classes.js";
import {
  selectFood,
  tentativeFood,
} from "../../javascript/aplicativo/vision-labels.js";
let modelPromise;
export async function classifyLocal(image, onProgress = () => {}) {
  if (!modelPromise) {
    onProgress(
      "Carregando reconhecimento gratuito. Na primeira análise, o download pode demorar.",
    );
    modelPromise = (async () => {
      await tf.setBackend("cpu");
      await tf.ready();
      return tf.loadLayersModel("/modelos/mobilenet/model.json");
    })().catch((error) => {
      modelPromise = undefined;
      throw error;
    });
  }
  const model = await modelPromise;
  onProgress("Analisando no seu aparelho…");
  const output = tf.tidy(() => {
    const pixels = tf.browser.fromPixels(image);
    const input = tf.image
      .resizeBilinear(pixels, [224, 224])
      .toFloat()
      .div(127.5)
      .sub(1)
      .expandDims();
    return model.predict(input);
  });
  let values;
  try {
    values = await output.data();
  } finally {
    output.dispose();
  }
  if (values.length !== 1000)
    throw Error("Modelo incompatível. Selecione o alimento no catálogo.");
  const predictions = Array.from(values, (probability, index) => ({
    probability,
    className: IMAGENET_CLASSES[index],
  }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);
  const confident = selectFood(predictions);
  const candidates = confident.length ? confident : tentativeFood(predictions);
  return {
    available: true,
    candidates,
    predictions,
    message: candidates.some((c) => c.tentative)
      ? "Não tenho segurança na identificação. O alimento abaixo é apenas uma possibilidade: confirme ou corrija pelo catálogo."
      : candidates.length
        ? "Confira o alimento sugerido. O reconhecimento local não confirma ingredientes nem quantidade."
        : "Não consegui reconhecer com segurança. Qual alimento aparece na foto? Selecione no catálogo ou informe o nome.",
  };
}
