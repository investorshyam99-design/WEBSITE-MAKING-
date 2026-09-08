const assert = require('assert');

function calc(productSubtotal, jerseyQuantity, isFast, isCod) {
  const baseCodCharge = 50 * jerseyQuantity;
  const fastShippingCharge = isFast ? (50 * jerseyQuantity) : 0;
  
  const prepaidTotalValue = productSubtotal + fastShippingCharge;
  const codTotalValue = productSubtotal + baseCodCharge + fastShippingCharge;
  const codAdvanceRequired = baseCodCharge + fastShippingCharge;
  
  const totalOrderValue = isCod ? codTotalValue : prepaidTotalValue;
  const advanceToCollect = isCod ? codAdvanceRequired : prepaidTotalValue;
  const amountOnDelivery = isCod ? productSubtotal : 0;

  return { totalOrderValue, advanceToCollect, amountOnDelivery, codAdvanceRequired };
}

// TEST 1
let t1 = calc(1199, 1, false, false);
assert.equal(t1.totalOrderValue, 1199);
assert.equal(t1.advanceToCollect, 1199);
assert.equal(t1.amountOnDelivery, 0);

// TEST 2
let t2 = calc(1199, 1, false, true);
assert.equal(t2.totalOrderValue, 1249);
assert.equal(t2.advanceToCollect, 50);
assert.equal(t2.amountOnDelivery, 1199);

// TEST 3
let t3 = calc(2398, 2, false, false);
assert.equal(t3.totalOrderValue, 2398);
assert.equal(t3.advanceToCollect, 2398);
assert.equal(t3.amountOnDelivery, 0);

// TEST 4
let t4 = calc(2398, 2, false, true);
assert.equal(t4.totalOrderValue, 2498);
assert.equal(t4.advanceToCollect, 100);
assert.equal(t4.amountOnDelivery, 2398);

// TEST 5
let t5 = calc(2398, 2, true, false);
assert.equal(t5.totalOrderValue, 2498);
assert.equal(t5.advanceToCollect, 2498);
assert.equal(t5.amountOnDelivery, 0);

// TEST 6
let t6 = calc(2398, 2, true, true);
assert.equal(t6.totalOrderValue, 2598);
assert.equal(t6.advanceToCollect, 200);
assert.equal(t6.amountOnDelivery, 2398);
assert.equal(t6.codAdvanceRequired, 200);

// TEST 7
let t7 = calc(3597, 3, true, true);
assert.equal(t7.totalOrderValue, 3897);
assert.equal(t7.advanceToCollect, 300); // 3 * 50 = 150 (Fast) + 150 (COD) = 300
assert.equal(t7.amountOnDelivery, 3597);

console.log("All pricing logic tests passed!");
