export const getLastPositionTool = (chart5mRef, chart1hRef, chart1dRef) => {
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
    }
  });

  return lastTool;
};

