export const getPositionToolData = (chart5mRef, chart1hRef, chart1dRef, lineToolId) => {
  const charts = [
    { chart: chart5mRef.current, interval: "5m" },
    { chart: chart1hRef.current, interval: "1h" },
    { chart: chart1dRef.current, interval: "1d" },
  ].filter((item) => item.chart !== null);

  for (const { chart } of charts) {
    try {
      const exportedTools = chart.exportLineTools();
      const tools = JSON.parse(exportedTools);

      const positionTool = tools.find(
        (tool) => tool.toolType === "LongShortPosition" && tool.id === lineToolId
      );

      if (positionTool && positionTool.points && positionTool.points.length >= 3) {
        return {
          stopLossPrice: positionTool.points[1].price,
          takeProfitPrice: positionTool.points[2].price,
        };
      }
    } catch {
    }
  }

  return null;
};

