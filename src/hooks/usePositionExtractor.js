import { calculateEntryPtCoins, calculateEntryPtUSDT } from "../utils/positionCalculations";

export const usePositionExtractor = () => {
  const getLastPositionTool = (chart5mRef, chart1hRef, chart1dRef) => {
    const charts = [
      { chart: chart5mRef.current, interval: "5m" },
      { chart: chart1hRef.current, interval: "1h" },
      { chart: chart1dRef.current, interval: "1d" },
    ].filter((item) => item.chart !== null);

    let lastTool = null;
    let lastTimestamp = 0;

    charts.forEach(({ chart, interval }) => {
      try {
        const exportedTools = chart.exportLineTools();
        const tools = JSON.parse(exportedTools);

        const positionTools = tools.filter(
          (tool) => tool.toolType === "LongShortPosition"
        );

        positionTools.forEach((tool) => {
          const points = tool.points;
          if (points && points.length >= 3) {
            const timestamp = Math.max(
              points[0].timestamp,
              points[1].timestamp,
              points[2].timestamp
            );
            if (timestamp > lastTimestamp) {
              lastTimestamp = timestamp;
              lastTool = { ...tool, interval };
            }
          }
        });
      } catch {
      void 0;
      }
    });

    return lastTool;
  };

  const extractPositionData = (chart5mRef, chart1hRef, chart1dRef, symbol, risk) => {
    const charts = [
      { chart: chart5mRef.current, interval: "5m" },
      { chart: chart1hRef.current, interval: "1h" },
      { chart: chart1dRef.current, interval: "1d" },
    ].filter((item) => item.chart !== null);

    const allPositions = [];

    charts.forEach(({ chart, interval }) => {
      try {
        const exportedTools = chart.exportLineTools();
        const tools = JSON.parse(exportedTools);

        const positionTools = tools.filter(
          (tool) => tool.toolType === "LongShortPosition"
        );

        positionTools.forEach((tool) => {
          const points = tool.points;
          if (points && points.length >= 3) {
            const entryPrice = points[0].price;
            const stopLossPrice = points[1].price;
            const takeProfitPrice = points[2].price;

            const isLong = entryPrice > stopLossPrice;
            const direction = isLong ? "Long" : "Short";
            const riskValue = parseFloat(risk) || 0;
            const entryPtCoinsValue = calculateEntryPtCoins(riskValue, entryPrice, stopLossPrice, direction);
            const entryPtUSDTValue = calculateEntryPtUSDT(entryPrice, entryPtCoinsValue);

            allPositions.push({
              id: tool.id,
              interval: interval,
              symbol: symbol,
              direction: direction,
              entryPrice: entryPrice,
              stopLoss: stopLossPrice,
              takeProfit: takeProfitPrice,
              entryPtUSDT: entryPtUSDTValue,
              entryPtCoins: entryPtCoinsValue,
            });
          }
        });
      } catch {
      void 0;
      }
    });

    return allPositions;
  };

  return { getLastPositionTool, extractPositionData };
};

