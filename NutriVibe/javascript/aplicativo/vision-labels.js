// Correspondências exatas das classes ImageNet do MobileNet; não infere receitas.
const labels = new Map([
  ["banana", "0"],
  ["Granny Smith", "1"],
  ["broccoli", "2"],
  ["cucumber, cuke", "23"],
  ["strawberry", "20"],
]);
export function selectFood(predictions) {
  const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
  const best = sorted[0];
  if (!best) return [];
  const id = labels.get(best.className);
  if (
    !id ||
    !Number.isFinite(best.probability) ||
    best.probability < 0.55 ||
    best.probability - (sorted[1]?.probability || 0) < 0.15
  )
    return [];
  return [{ foodId: id, confidence: best.probability }];
}
