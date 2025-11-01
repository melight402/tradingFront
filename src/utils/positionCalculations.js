export const calculatePositionQuantity = (riskAmount, entryPrice, stopLossPrice) => {
  if (!riskAmount || !entryPrice || !stopLossPrice || riskAmount <= 0 || entryPrice <= 0 || stopLossPrice <= 0) {
    return 0;
  }

  const priceDifference = Math.abs(entryPrice - stopLossPrice);

  if (priceDifference === 0) {
    return 0;
  }

  const quantity = riskAmount / priceDifference;

  return Math.max(0, quantity);
};

export const calculateTakeProfitPrice = (entryPrice, stopLossPrice, takeProfitMultiplier, direction) => {
  if (!entryPrice || !stopLossPrice || !takeProfitMultiplier || entryPrice <= 0 || stopLossPrice <= 0) {
    return null;
  }

  const isLong = direction === "Long" || direction === "BUY" || direction === "buy";
  const priceDifference = Math.abs(entryPrice - stopLossPrice);
  const takeProfitDistance = priceDifference * parseFloat(takeProfitMultiplier);

  if (isLong) {
    return entryPrice + takeProfitDistance;
  } else {
    return entryPrice - takeProfitDistance;
  }
};

export const calculateEntryPtCoins = (risk, entryPrice, stopLoss, direction) => {
  if (!risk || !entryPrice || !stopLoss || risk <= 0 || entryPrice <= 0 || stopLoss <= 0) {
    return 0;
  }

  const isLong = direction === "Long" || direction === "BUY" || direction === "buy";
  let priceDifference;

  if (isLong) {
    priceDifference = entryPrice - stopLoss;
  } else {
    priceDifference = stopLoss - entryPrice;
  }

  if (priceDifference <= 0) {
    return 0;
  }

  const entryPtCoins = risk / priceDifference;
  return Math.max(0, entryPtCoins);
};

export const calculateEntryPtUSDT = (entryPrice, entryPtCoins) => {
  if (!entryPrice || !entryPtCoins || entryPrice <= 0 || entryPtCoins <= 0) {
    return 0;
  }

  return entryPrice * entryPtCoins;
};

