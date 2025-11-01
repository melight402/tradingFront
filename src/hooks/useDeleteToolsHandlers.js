import { useMemo } from "react";
import { persistLineToolsFromChart, removeAllLineToolsFromStorage, removeLineToolsFromStorage } from "../services/lineToolsManager";
import { clearAllChartStates } from "../services/chartStateStorage";

export const useDeleteToolsHandlers = (chart5mRef, chart1hRef, chart1dRef, symbol) => {
  return useMemo(() => ({
    onDeleteSelected: () => {
      const charts = [
        chart5mRef.current,
        chart1hRef.current,
        chart1dRef.current
      ].filter(chart => chart);
      
      charts.forEach((chart) => {
        try {
          chart.removeSelectedLineTools();
          setTimeout(() => {
            const exported = chart.exportLineTools();
            if (exported && exported.trim() !== '' && exported !== '[]') {
              persistLineToolsFromChart(chart, symbol);
            } else {
              removeLineToolsFromStorage(symbol);
            }
          }, 100);
        } catch {
          void 0;
        }
      });
    },
    onDeleteAll: () => {
      const charts = [
        chart5mRef.current,
        chart1hRef.current,
        chart1dRef.current
      ].filter(chart => chart);
      
      charts.forEach((chart) => {
        try {
          chart.removeAllLineTools();
        } catch {
          void 0;
        }
      });
      
      removeAllLineToolsFromStorage();
      clearAllChartStates();
    }
  }), [symbol, chart5mRef, chart1hRef, chart1dRef]);
};

