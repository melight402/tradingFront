import { useRef } from "react";
import { useDrawingToolActivation } from "./useDrawingToolActivation";
import { useLineToolEditHandler } from "./useLineToolEditHandler";
import { useSymbolChangeHandler } from "./useSymbolChangeHandler";
import { useLineToolRestore } from "./useLineToolRestore";

export const useChartLineTools = (
  chart,
  candlestickSeries,
  volumeSeries,
  symbol,
  interval,
  prevSymbolRef,
  prevIntervalRef,
  currentSymbolRef,
  currentIntervalRef,
  isInitialRender,
  drawingTool,
  drawingToolRef,
  isRestoringStateRef,
  setPopupState,
  onDrawingToolDeactivate
) => {
  const shouldLoadLineToolsAfterDataUpdate = useRef(false);
  const pendingSymbolRef = useRef(null);
  const pendingIntervalRef = useRef(null);
  const lineToolsRestoredRef = useRef(false);
  const lineToolsModifiedRef = useRef(false);
  const justFinishedDrawingRef = useRef(false);

  useSymbolChangeHandler(
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
  );

  const { restoreLineTools } = useLineToolRestore(
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
  );

  useDrawingToolActivation(chart, candlestickSeries, drawingTool, symbol, setPopupState, isRestoringStateRef, currentSymbolRef, justFinishedDrawingRef);

  useLineToolEditHandler(
    chart,
    drawingToolRef,
    isRestoringStateRef,
    onDrawingToolDeactivate,
    justFinishedDrawingRef
  );

  return { restoreLineTools };
};
