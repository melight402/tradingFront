export const getFinalPositionValues = (lastTool) => {
  if (lastTool && lastTool.points && lastTool.points.length >= 3) {
    const points = lastTool.points;
    return {
      entryPrice: points[0].price,
      stopLoss: points[1].price,
      takeProfit: points[2].price,
      direction: points[0].price > points[1].price ? "Long" : "Short",
    };
  }

  return null;
};

