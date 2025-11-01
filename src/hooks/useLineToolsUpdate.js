import { useEffect } from "react";

export const useLineToolsUpdate = (chart5mRef, chart1hRef, chart1dRef, symbol, risk) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const charts = [
      { chart: chart5mRef.current, interval: '5m' },
      { chart: chart1hRef.current, interval: '1h' },
      { chart: chart1dRef.current, interval: '1d' }
    ].filter(item => item.chart);

    charts.forEach(({ chart }) => {
      try {
        const exported = chart.exportLineTools();
        if (exported && exported !== '[]') {
          const tools = JSON.parse(exported);
          tools.forEach((tool) => {
            if (tool.toolType === 'LongShortPosition') {
              const updatedTool = {
                ...tool,
                options: {
                  ...tool.options,
                  symbol: symbol || '',
                  risk: parseFloat(window.__CURRENT_RISK || 0) || 0
                }
              };
              chart.applyLineToolOptions(updatedTool);
            }
          });
        }
      } catch (error) {
        console.warn('Error updating line tools:', error);
      }
    });
  }, [symbol, risk, chart5mRef, chart1hRef, chart1dRef]);
};

