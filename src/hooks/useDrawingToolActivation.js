import { useEffect, useRef } from "react";

const getToolOptions = (drawingTool, symbol) => {
  if (drawingTool === 'LongShortPosition') {
    return {
      risk: parseFloat(window.__CURRENT_RISK || 0) || 0,
      symbol: symbol || ''
    };
  } else if (drawingTool === 'FibRetracement') {
    return {
      levels: [
        { color: '#787b86', coeff: 0, opacity: 0, distanceFromCoeffEnabled: false, distanceFromCoeff: 0 },
        { color: '#81c784', coeff: 0.382, opacity: 0, distanceFromCoeffEnabled: false, distanceFromCoeff: 0 },
        { color: '#4caf50', coeff: 0.5, opacity: 0, distanceFromCoeffEnabled: false, distanceFromCoeff: 0 },
        { color: '#089981', coeff: 0.618, opacity: 0, distanceFromCoeffEnabled: false, distanceFromCoeff: 0 },
        { color: '#787b86', coeff: 1, opacity: 0, distanceFromCoeffEnabled: false, distanceFromCoeff: 0 },
        { color: '#2962ff', coeff: 1.618, opacity: 0, distanceFromCoeffEnabled: false, distanceFromCoeff: 0 },
      ]
    };
  }
  return {};
};

export const useDrawingToolActivation = (chart, candlestickSeries, drawingTool, symbol, setPopupState, isRestoringStateRef, currentSymbolRef, justFinishedDrawingRef) => {
  const prevDrawingToolRef = useRef(drawingTool);

  useEffect(() => {
    if (!chart.current || !candlestickSeries.current) return;

    if (justFinishedDrawingRef?.current && drawingTool === prevDrawingToolRef.current) {
      return;
    }

    if (drawingTool) {
      setPopupState(prev => {
        if (prev.open === 0 && prev.high === 0 && prev.low === 0 && prev.close === 0) {
          return prev;
        }
        return {
          open: 0,
          high: 0,
          low: 0,
          close: 0,
        };
      });
      try {
        const options = getToolOptions(drawingTool, symbol);
        chart.current.setActiveLineTool(drawingTool, options);
      } catch {
      void 0;
      }
    } else {
      try {
        chart.current.setActiveLineTool(null);
      } catch {
      void 0;
        void 0;
      }
    }

    prevDrawingToolRef.current = drawingTool;
  }, [drawingTool, chart, candlestickSeries, setPopupState, symbol, isRestoringStateRef, currentSymbolRef, justFinishedDrawingRef]);
};

