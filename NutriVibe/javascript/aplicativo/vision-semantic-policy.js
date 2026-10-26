export function rankImage(features, config) {
  let norm = 0;
  for (const v of features) norm += v * v;
  norm = Math.sqrt(norm);
  if (!Number.isFinite(norm) || norm === 0)
    return { candidates: [], ranking: [] };
  if (!config.vectors.length || config.vectors[0].length !== features.length)
    throw Error("Vetor visual incompatível.");
  const ranking = config.classes
    .map((item, index) => {
      let score = 0;
      for (let k = 0; k < features.length; k++)
        score += (features[k] * config.vectors[index][k]) / norm;
      return { ...item, score };
    })
    .sort((a, b) => b.score - a.score);
  const best = ranking[0],
    margin = best.score - (ranking[1]?.score || 0);
  if (
    best.kind === "negative" ||
    best.score < config.minimumScore ||
    margin < config.minimumMargin
  )
    return { candidates: [], ranking, margin };
  return {
    candidates: [
      {
        foodId: best.kind === "food" ? best.id : null,
        recognizedId: best.id,
        label: best.label,
        kind: best.kind,
        similarity: best.score,
        margin,
        tentative: margin < 0.02 || best.score < 0.07,
      },
    ],
    ranking,
    margin,
  };
}
