const assert = require('assert');

function calc(productSubtotal, jerseyQuantity, isFast, isCod) {
  const codCharge = isCod ? (50 * jerseyQuantity) : 0;
  const fastShippingCharge = isFast ? (50 * jerseyQuantity) : 0;
  
  const totalOrderValue = productSubtotal + codCharge + fastShippingCharge;
  const amountToPayNow = isCod ? codCharge : totalOrderValue;
  const remainingAmountOnDelivery = isCod ? totalOrderValue - codCharge : 0;

  return { totalOrderValue, amountToPayNow, remainingAmountOnDelivery };
}

// TEST 1
let t1 = calc(1199, 1, false, false);
assert.equal(t1.totalOrderValue, 1199);
assert.equal(t1.amountToPayNow, 1199);
assert.equal(t1.remainingAmountOnDelivery, 0);

// TEST 2
let t2 = calc(1199, 1, false, true);
assert.equal(t2.totalOrderValue, 1249);
assert.equal(t2.amountToPayNow, 50);
assert.equal(t2.remainingAmountOnDelivery, 1199);

// TEST 3
let t3 = calc(2398, 2, false, false);
assert.equal(t3.totalOrderValue, 2398);
assert.equal(t3.amountToPayNow, 2398);
assert.equal(t3.remainingAmountOnDelivery, 0);

// TEST 4
let t4 = calc(2398, 2, false, true);
assert.equal(t4.totalOrderValue, 2498);
assert.equal(t4.amountToPayNow, 100);
assert.equal(t4.remainingAmountOnDelivery, 2398);

// TEST 5
let t5 = calc(2398, 2, true, false);
assert.equal(t5.totalOrderValue, 2498);
assert.equal(t5.amountToPayNow, 2498);
assert.equal(t5.remainingAmountOnDelivery, 0);

// TEST 6
let t6 = calc(2398, 2, true, true);
assert.equal(t6.totalOrderValue, 2598);
assert.equal(t6.amountToPayNow, 100);
assert.equal(t6.remainingAmountOnDelivery, 2498);

// TEST 7
let t7 = calc(3597, 3, true, true);
assert.equal(t7.totalOrderValue, 3897);
assert.equal(t7.amountToPayNow, 150);
assert.equal(t7.remainingAmountOnDelivery, 3747);

console.log("All pricing logic tests passed!");
