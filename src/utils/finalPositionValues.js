export const getFinalPositionValues = (lastTool, purchasePrice, manualStopLoss) => {
  if (lastTool && lastTool.points && lastTool.points.length >= 3) {
    const points = lastTool.points;
    return {
      entryPrice: points[0].price,
      stopLoss: points[1].price,
      takeProfit: points[2].price,
      direction: points[0].price > points[1].price ? "Long" : "Short",
    };
  }

  const hasManualValues = 
    (purchasePrice && purchasePrice > 0) || 
    (manualStopLoss && manualStopLoss > 0);

  if (!hasManualValues) {
    return null;
  }

  if (purchasePrice && purchasePrice > 0 && manualStopLoss && manualStopLoss > 0) {
    const direction = purchasePrice > manualStopLoss ? "Long" : "Short";

    return {
      entryPrice: purchasePrice,
      stopLoss: manualStopLoss,
      takeProfit: null,
      direction: direction,
    };
  }

  return null;
};

