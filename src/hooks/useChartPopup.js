import { useState, useRef, useEffect } from "react";

export const useChartPopup = (chart, candlestickSeries, loaded, drawingToolRef) => {
  const [popupState, setPopupState] = useState({
    open: 0,
    high: 0,
    low: 0,
    close: 0,
  });
  
  const crosshairHandlerRef = useRef(null);
  const lastStateRef = useRef({ open: 0, high: 0, low: 0, close: 0 });

  const updateStateIfChanged = (newState) => {
    if (
      lastStateRef.current.open !== newState.open ||
      lastStateRef.current.high !== newState.high ||
      lastStateRef.current.low !== newState.low ||
      lastStateRef.current.close !== newState.close
    ) {
      lastStateRef.current = newState;
      setPopupState(newState);
    }
  };

  useEffect(() => {
    if (!chart.current || !candlestickSeries.current) return;

    const handleCrosshairMove = (param) => {
      try {
        const emptyState = { open: 0, high: 0, low: 0, close: 0 };

        if (drawingToolRef?.current) {
          updateStateIfChanged(emptyState);
          return;
        }

        if (!chart.current || !candlestickSeries.current) {
          updateStateIfChanged(emptyState);
          return;
        }

        if (!param || !param.seriesPrices || !(param.seriesPrices instanceof Map)) {
          updateStateIfChanged(emptyState);
          return;
        }

        const currentSeries = candlestickSeries.current;
        if (!currentSeries) {
          updateStateIfChanged(emptyState);
          return;
        }

        const candlestickData = param.seriesPrices.get(currentSeries);
        
        if (!candlestickData || typeof candlestickData !== 'object') {
          updateStateIfChanged(emptyState);
          return;
        }

        const hasCandleFields = 'open' in candlestickData || 'high' in candlestickData || 
                                'low' in candlestickData || 'close' in candlestickData;
        
        if (!hasCandleFields) {
          updateStateIfChanged(emptyState);
          return;
        }

        const open = typeof candlestickData.open === 'number' ? candlestickData.open : null;
        const high = typeof candlestickData.high === 'number' ? candlestickData.high : null;
        const low = typeof candlestickData.low === 'number' ? candlestickData.low : null;
        const close = typeof candlestickData.close === 'number' ? candlestickData.close : null;

        if (open === null && high === null && low === null && close === null) {
          updateStateIfChanged(emptyState);
          return;
        }
        
        const newState = {
          open: open || 0,
          high: high || 0,
          low: low || 0,
          close: close || 0,
        };
        
        updateStateIfChanged(newState);
      } catch {
      void 0;
        updateStateIfChanged({ open: 0, high: 0, low: 0, close: 0 });
      }
    };

    crosshairHandlerRef.current = handleCrosshairMove;

    const timeoutId = setTimeout(() => {
      if (chart.current && candlestickSeries.current && crosshairHandlerRef.current) {
        try {
          chart.current.subscribeCrosshairMove(crosshairHandlerRef.current);
        } catch {
      void 0;
          void 0;
        }
      }
    }, 100);

    const chartInstance = chart.current;
    return () => {
      clearTimeout(timeoutId);
      if (chartInstance && crosshairHandlerRef.current) {
        try {
          chartInstance.unsubscribeCrosshairMove(crosshairHandlerRef.current);
        } catch {
      void 0;
          void 0;
        }
      }
      crosshairHandlerRef.current = null;
    };
  }, [chart, candlestickSeries, loaded, drawingToolRef]);

  return { popupState, setPopupState };
};

