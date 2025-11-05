import { useState, useRef, useEffect } from "react";

export const useChartPopup = (chart, candlestickSeries, loaded, drawingToolRef) => {
  const [popupState, setPopupState] = useState({
    visible: false,
    open: 0,
    high: 0,
    low: 0,
    close: 0,
  });
  
  const crosshairHandlerRef = useRef(null);

  useEffect(() => {
    if (!chart.current || !candlestickSeries.current) return;

    const handleCrosshairMove = (param) => {
      try {
        if (drawingToolRef?.current) {
          setPopupState(prev => ({ ...prev, visible: false }));
          return;
        }

        if (!chart.current || !candlestickSeries.current) {
          setPopupState(prev => ({ ...prev, visible: false }));
          return;
        }

        if (!param || !param.seriesPrices || !(param.seriesPrices instanceof Map)) {
          setPopupState(prev => ({ ...prev, visible: false }));
          return;
        }

        const currentSeries = candlestickSeries.current;
        if (!currentSeries) {
          setPopupState(prev => ({ ...prev, visible: false }));
          return;
        }

        const candlestickData = param.seriesPrices.get(currentSeries);
        
        if (!candlestickData || typeof candlestickData !== 'object') {
          setPopupState(prev => ({ ...prev, visible: false }));
          return;
        }

        const hasCandleFields = 'open' in candlestickData || 'high' in candlestickData || 
                                'low' in candlestickData || 'close' in candlestickData;
        
        if (!hasCandleFields) {
          setPopupState(prev => ({ ...prev, visible: false }));
          return;
        }

        const open = typeof candlestickData.open === 'number' ? candlestickData.open : null;
        const high = typeof candlestickData.high === 'number' ? candlestickData.high : null;
        const low = typeof candlestickData.low === 'number' ? candlestickData.low : null;
        const close = typeof candlestickData.close === 'number' ? candlestickData.close : null;

        if (open === null && high === null && low === null && close === null) {
          setPopupState(prev => ({ ...prev, visible: false }));
          return;
        }
        
        setPopupState({
          visible: true,
          open: open || 0,
          high: high || 0,
          low: low || 0,
          close: close || 0,
        });
      } catch {
        setPopupState(prev => ({ ...prev, visible: false }));
      }
    };

    crosshairHandlerRef.current = handleCrosshairMove;

    const timeoutId = setTimeout(() => {
      if (chart.current && candlestickSeries.current && crosshairHandlerRef.current) {
        try {
          chart.current.subscribeCrosshairMove(crosshairHandlerRef.current);
        } catch {
          void 0;
        }
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (chart.current && crosshairHandlerRef.current) {
        try {
          chart.current.unsubscribeCrosshairMove(crosshairHandlerRef.current);
        } catch {
          void 0;
        }
      }
      crosshairHandlerRef.current = null;
    };
  }, [chart, candlestickSeries, loaded, drawingToolRef]);

  return { popupState, setPopupState };
};

