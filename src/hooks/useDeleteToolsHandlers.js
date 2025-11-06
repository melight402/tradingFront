import { useMemo } from "react";
import { useChartState } from "../contexts/ChartStateContext";
import { exportLineToolsFromChart } from "../services/lineToolsManager";
import { removeAllLineToolsFromStorage } from "../services/lineToolsManager";
import { clearAllChartStates } from "../services/chartStateStorage";

export const useDeleteToolsHandlers = (chart5mRef, chart1hRef, chart1dRef, symbol) => {
  const { setLineTools } = useChartState();
  
  return useMemo(() => ({
    onDeleteSelected: () => {
      const charts = [
        { chart: chart5mRef.current, interval: "5m" },
        { chart: chart1hRef.current, interval: "1h" },
        { chart: chart1dRef.current, interval: "1d" }
      ].filter(item => item.chart);
      
      charts.forEach(({ chart, interval }) => {
        try {
          chart.removeSelectedLineTools();
          setTimeout(() => {
            const exported = exportLineToolsFromChart(chart);
            if (exported) {
              setLineTools(symbol, interval, exported);
            } else {
              setLineTools(symbol, interval, null);
            }
          }, 100);
        } catch {
      void 0;
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
          void 0;
        }
      });
      
      removeAllLineToolsFromStorage();
      clearAllChartStates();
    }
  }), [symbol, chart5mRef, chart1hRef, chart1dRef, setLineTools]);
};

