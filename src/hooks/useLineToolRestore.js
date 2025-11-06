import { useCallback } from "react";
import { useChartState } from "../contexts/ChartStateContext";
import { importLineToolsToChart } from "../services/lineToolsManager";

export const useLineToolRestore = (
  chart,
  candlestickSeries,
  volumeSeries,
  symbol,
  interval,
  currentSymbolRef,
  currentIntervalRef,
  prevSymbolRef,
  prevIntervalRef,
  isInitialRender,
  shouldLoadLineToolsAfterDataUpdate,
  pendingSymbolRef,
  pendingIntervalRef,
  lineToolsRestoredRef,
  lineToolsModifiedRef
) => {
  const { getLineTools } = useChartState();
  
  const restoreLineTools = useCallback((data, loaded, updateChartData) => {
    if (!loaded || !data || !data.length || !chart.current || !candlestickSeries.current || !volumeSeries.current) {
      return;
    }

    if (currentSymbolRef.current !== symbol || currentIntervalRef.current !== interval) {
      return;
    }

    if (data.length < 1) {
      return;
    }

    setTimeout(() => {
      if (currentSymbolRef.current === symbol && currentIntervalRef.current === interval && 
          chart.current && candlestickSeries.current && volumeSeries.current && 
          data && data.length >= 1 && !isInitialRender.current) {
        updateChartData(data);
      }
      
      if (shouldLoadLineToolsAfterDataUpdate.current) {
        const targetSymbol = pendingSymbolRef.current || symbol;
        const targetInterval = pendingIntervalRef.current || interval;
        
        if (targetSymbol === symbol && targetInterval === interval && !lineToolsRestoredRef.current) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setTimeout(() => {
                if (chart.current && candlestickSeries.current && volumeSeries.current && !lineToolsRestoredRef.current) {
                  const saved = getLineTools(targetSymbol, targetInterval);
                  if (saved) {
                    const restored = importLineToolsToChart(chart.current, saved);
                    if (restored) {
                      lineToolsRestoredRef.current = true;
                      lineToolsModifiedRef.current = true;
                    }
                  }
                }
                shouldLoadLineToolsAfterDataUpdate.current = false;
                pendingSymbolRef.current = null;
                pendingIntervalRef.current = null;
              }, 800);
            });
          });
        }
      } else if (isInitialRender.current && prevSymbolRef.current === symbol && prevIntervalRef.current === interval && !lineToolsRestoredRef.current) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              if (chart.current && candlestickSeries.current && volumeSeries.current && !lineToolsRestoredRef.current) {
                const saved = getLineTools(symbol, interval);
                if (saved) {
                  const restored = importLineToolsToChart(chart.current, saved);
                  if (restored) {
                    lineToolsRestoredRef.current = true;
                    lineToolsModifiedRef.current = true;
                  }
                }
              }
            }, 1200);
          });
        });
      }
    }, 0);
  }, [chart, candlestickSeries, volumeSeries, symbol, interval, currentSymbolRef, currentIntervalRef, prevSymbolRef, prevIntervalRef, isInitialRender, shouldLoadLineToolsAfterDataUpdate, pendingSymbolRef, pendingIntervalRef, lineToolsRestoredRef, lineToolsModifiedRef, getLineTools]);

  return { restoreLineTools };
};

