import { useState, useEffect } from "react";

const getHorizontalLinePrice = (chart5mRef, chart1hRef, chart1dRef) => {
  const charts = [
    { chart: chart5mRef?.current, interval: "5m" },
    { chart: chart1hRef?.current, interval: "1h" },
    { chart: chart1dRef?.current, interval: "1d" },
  ].filter((item) => item.chart !== null);

  for (const { chart } of charts) {
    try {
      const exportedTools = chart.exportLineTools();
      const tools = JSON.parse(exportedTools);

      const horizontalLines = tools.filter(
        (tool) => tool.toolType === "HorizontalLine"
      );

      if (horizontalLines.length > 0) {
        const lastLine = horizontalLines[horizontalLines.length - 1];
        if (lastLine.points && lastLine.points.length > 0) {
          return lastLine.points[0].price;
        }
      }
    } catch {
      void 0;
      void 0;
    }
  }

  return null;
};

export const useHorizontalLinePrice = (chart5mRef, chart1hRef, chart1dRef) => {
  const [price, setPrice] = useState(() => getHorizontalLinePrice(chart5mRef, chart1hRef, chart1dRef));

  useEffect(() => {
    const updatePrice = () => {
      const newPrice = getHorizontalLinePrice(chart5mRef, chart1hRef, chart1dRef);
      setPrice(newPrice);
    };

    const charts = [
      chart5mRef?.current,
      chart1hRef?.current,
      chart1dRef?.current,
    ].filter((chart) => chart !== null);

    const subscriptions = charts.map((chart) => {
      const handler = () => {
        setTimeout(updatePrice, 100);
      };
      try {
        chart.subscribeLineToolsAfterEdit(handler);
        return () => {
          try {
            chart.unsubscribeLineToolsAfterEdit(handler);
          } catch {
      void 0;
            void 0;
          }
        };
      } catch {
      void 0;
        return null;
      }
    });

    const interval = setInterval(updatePrice, 500);

    return () => {
      clearInterval(interval);
      subscriptions.forEach((unsubscribe) => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [chart5mRef, chart1hRef, chart1dRef]);

  return price;
};

