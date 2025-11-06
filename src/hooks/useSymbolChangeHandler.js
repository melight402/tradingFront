import { useEffect } from "react";
import { useChartState } from "../contexts/ChartStateContext";
import { exportLineToolsFromChart } from "../services/lineToolsManager";

export const useSymbolChangeHandler = (
  chart,
  candlestickSeries,
  symbol,
  interval,
  prevSymbolRef,
  prevIntervalRef,
  currentSymbolRef,
  currentIntervalRef,
  isInitialRender,
  shouldLoadLineToolsAfterDataUpdate,
  pendingSymbolRef,
  pendingIntervalRef,
  lineToolsRestoredRef,
  lineToolsModifiedRef
) => {
  const { setLineTools } = useChartState();
  useEffect(() => {
    const symbolChanged = prevSymbolRef.current !== symbol;
    const intervalChanged = prevIntervalRef.current !== interval;
    
    if (!chart.current) {
      isInitialRender.current = true;
      currentSymbolRef.current = symbol;
      currentIntervalRef.current = interval;
      prevSymbolRef.current = symbol;
      prevIntervalRef.current = interval;
      lineToolsRestoredRef.current = false;
      lineToolsModifiedRef.current = false;
      return;
    }

    if (symbolChanged || intervalChanged) {
      const oldSymbol = prevSymbolRef.current;
      const oldInterval = prevIntervalRef.current;
      
      if (chart.current && candlestickSeries.current) {
        try {
          if (oldSymbol && oldInterval) {
            const exported = exportLineToolsFromChart(chart.current);
            if (exported) {
              setLineTools(oldSymbol, oldInterval, exported);
            }
          }
        } catch {
          void 0;
        }

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            try {
              if (chart.current) {
                chart.current.removeAllLineTools();
              }
            } catch {
              void 0;
            }
          });
        });
      }

      shouldLoadLineToolsAfterDataUpdate.current = true;
      pendingSymbolRef.current = symbol;
      pendingIntervalRef.current = interval;
      lineToolsRestoredRef.current = false;
      lineToolsModifiedRef.current = false;
    }

    if (!symbolChanged && !intervalChanged) {
      isInitialRender.current = true;
      currentSymbolRef.current = symbol;
      currentIntervalRef.current = interval;
      prevSymbolRef.current = symbol;
      prevIntervalRef.current = interval;
    } else {
      setTimeout(() => {
        isInitialRender.current = true;
        currentSymbolRef.current = symbol;
        currentIntervalRef.current = interval;
        prevSymbolRef.current = symbol;
        prevIntervalRef.current = interval;
      }, 150);
    }
  }, [symbol, interval, chart, candlestickSeries, prevSymbolRef, prevIntervalRef, currentSymbolRef, currentIntervalRef, isInitialRender, shouldLoadLineToolsAfterDataUpdate, pendingSymbolRef, pendingIntervalRef, lineToolsRestoredRef, lineToolsModifiedRef, setLineTools]);
};

