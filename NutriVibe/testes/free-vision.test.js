import test from "node:test";
import assert from "node:assert/strict";
import { selectFood } from "../javascript/aplicativo/vision-labels.js";
test("classificação local aceita apenas classe conhecida com margem suficiente", () => {
  assert.deepEqual(
    selectFood([
      { className: "banana", probability: 0.9 },
      { className: "orange", probability: 0.07 },
    ]),
    [{ foodId: "0", confidence: 0.9 }],
  );
  assert.deepEqual(selectFood([{ className: "pizza", probability: 0.99 }]), []);
  assert.deepEqual(
    selectFood([{ className: "banana", probability: 0.54 }]),
    [],
  );
  assert.deepEqual(
    selectFood([
      { className: "banana", probability: 0.6 },
      { className: "orange", probability: 0.5 },
    ]),
    [],
  );
  assert.deepEqual(
    selectFood([{ className: "sea cucumber, holothurian", probability: 0.99 }]),
    [],
  );
});
import { tentativeFood } from "../javascript/aplicativo/vision-labels.js";
test("hipótese fraca exige confirmação e não usa alimento de classe secundária", () => {
  assert.equal(
    tentativeFood([{ className: "banana", probability: 0.19 }])[0].tentative,
    true,
  );
  assert.deepEqual(
    tentativeFood([
      { className: "pizza", probability: 0.6 },
      { className: "banana", probability: 0.2 },
    ]),
    [],
  );
  assert.deepEqual(
    tentativeFood([{ className: "banana", probability: 0.1 }]),
    [],
  );
});
