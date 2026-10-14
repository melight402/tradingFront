import test from "node:test";
import assert from "node:assert/strict";
import { formatPrice } from "./format.js";
import { floorToStep, roundToStep } from "./precision.js";
import { positionQty, positionSizeUSDT } from "./risk.js";

test("formats and snaps HBAR prices to Binance tick size", () => {
  assert.equal(formatPrice(0.11799, 0.00001), "0.11799");
  assert.equal(roundToStep(0.117994, 0.00001), 0.11799);
});

test("rounds position quantity down and keeps risk within its limit", () => {
  const quantity = positionQty(0.1, 0.118, 0.1174, 0.1);
  assert.equal(quantity, 166.6);
  assert.equal(floorToStep(1.29, 0.1), 1.2);
  assert.ok(quantity * Math.abs(0.118 - 0.1174) <= 0.1);
  assert.equal(positionSizeUSDT(0.1, 0.118, 0.1174, 0.1), 19.6588);
});