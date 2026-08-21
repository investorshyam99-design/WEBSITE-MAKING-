const assert = require('assert');

function runTest(order) {
  const rawType = order.deliveryType || "NORMAL";
  const effectiveDeliveryType = String(rawType).toUpperCase() === "FAST" ? "FAST" : "NORMAL";
  return effectiveDeliveryType;
}

assert.strictEqual(runTest({}), "NORMAL"); // No deliveryType
assert.strictEqual(runTest({ deliveryType: "normal" }), "NORMAL");
assert.strictEqual(runTest({ deliveryType: "fast" }), "FAST");
assert.strictEqual(runTest({ deliveryType: null }), "NORMAL");
assert.strictEqual(runTest({ deliveryType: undefined }), "NORMAL");
assert.strictEqual(runTest({ deliveryType: "" }), "NORMAL");

console.log("All tests passed!");
