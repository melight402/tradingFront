import { useCallback } from "react";
import { restoreLineToolsToChart } from "../services/lineToolsManager";

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
  lineToolsModifiedRef,
  isRestoringStateRef
) => {
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
                  isRestoringStateRef.current = true;
                  const restored = restoreLineToolsToChart(chart.current, targetSymbol, targetInterval);
                  if (restored) {
                    lineToolsRestoredRef.current = true;
                    lineToolsModifiedRef.current = true;
                  }
                  setTimeout(() => {
                    isRestoringStateRef.current = false;
                  }, 500);
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
                isRestoringStateRef.current = true;
                const restored = restoreLineToolsToChart(chart.current, symbol, interval);
                if (restored) {
                  lineToolsRestoredRef.current = true;
                  lineToolsModifiedRef.current = true;
                }
                setTimeout(() => {
                  isRestoringStateRef.current = false;
                }, 1000);
              }
            }, 1500);
          });
        });
      }
    }, 0);
  }, [chart, candlestickSeries, volumeSeries, symbol, interval, currentSymbolRef, currentIntervalRef, prevSymbolRef, prevIntervalRef, isInitialRender, shouldLoadLineToolsAfterDataUpdate, pendingSymbolRef, pendingIntervalRef, lineToolsRestoredRef, lineToolsModifiedRef, isRestoringStateRef]);

  return { restoreLineTools };
};

