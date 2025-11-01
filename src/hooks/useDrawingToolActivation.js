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

export const useDrawingToolActivation = (chart, candlestickSeries, drawingTool, symbol, setPopupState, isRestoringStateRef, currentSymbolRef) => {
  const prevDrawingToolRef = useRef(drawingTool);

  useEffect(() => {
    if (!chart.current || !candlestickSeries.current) return;

    if (drawingTool) {
      setPopupState(prev => ({ ...prev, visible: false }));
      try {
        const options = getToolOptions(drawingTool, symbol);
        chart.current.setActiveLineTool(drawingTool, options);
      } catch (error) {
        console.error("Error activating drawing tool:", error);
      }
    } else {
      try {
        chart.current.setActiveLineTool(null);
      } catch {
        void 0;
      }
    }

    prevDrawingToolRef.current = drawingTool;
  }, [drawingTool, chart, candlestickSeries, setPopupState, symbol, isRestoringStateRef, currentSymbolRef]);
};

