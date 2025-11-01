import { useEffect, useRef } from "react";
import { saveChartState } from "../services/chartStateStorage";

export const useChartStateAutoSave = (
  chart,
  candlestickSeries,
  currentSymbolRef,
  currentIntervalRef,
  isRestoringStateRef,
  chartKey
) => {
  const saveTimeoutRef = useRef(null);
  const lastSavedStateRef = useRef(null);
  const priceScaleIntervalRef = useRef(null);
  const lastPriceScaleStateRef = useRef(null);

  const saveState = () => {
    if (!chart.current || !candlestickSeries.current) return;
    if (isRestoringStateRef?.current) return;
    if (!currentSymbolRef.current || !currentIntervalRef.current || !chartKey) return;

    try {
      const timeScale = chart.current.timeScale();
      const priceScale = chart.current.priceScale('right');

      if (!timeScale || !priceScale) return;

      const state = {};

      const logicalRange = timeScale.getVisibleLogicalRange();
      const timeRange = timeScale.getVisibleRange();

      if (logicalRange && typeof logicalRange.from === 'number' && typeof logicalRange.to === 'number' &&
          !isNaN(logicalRange.from) && !isNaN(logicalRange.to)) {
        state.logicalRange = logicalRange;
      }
      if (timeRange && timeRange.from != null && timeRange.to != null) {
        state.timeRange = timeRange;
      }

      try {
        const priceScaleOptions = priceScale.options();
        state.priceScale = {
          autoScale: priceScaleOptions?.autoScale ?? true,
          scaleMargins: priceScaleOptions?.scaleMargins
        };

        try {
          const visibleRange = priceScale.getVisibleRange();
          if (visibleRange && visibleRange.minValue !== null && visibleRange.maxValue !== null) {
            state.priceRange = {
              from: visibleRange.minValue,
              to: visibleRange.maxValue
            };
          }
        } catch {
          void 0;
        }
      } catch {
        void 0;
      }

      const stateString = JSON.stringify(state);
      if (lastSavedStateRef.current !== stateString && 
          (state.logicalRange || state.timeRange || state.priceScale || state.priceRange)) {
        saveChartState(chartKey, currentSymbolRef.current, currentIntervalRef.current, state);
        lastSavedStateRef.current = stateString;
      }
    } catch {
      void 0;
    }
  };

  useEffect(() => {
    if (!chart.current || !candlestickSeries.current) return;
    if (!currentSymbolRef.current || !currentIntervalRef.current || !chartKey) return;

    const timeScale = chart.current.timeScale();
    const priceScale = chart.current.priceScale('right');

    if (!timeScale || !priceScale) return;

    const handleTimeRangeChange = () => {
      if (isRestoringStateRef?.current) return;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveState();
      }, 500);
    };

    const handlePriceScaleChange = () => {
      if (isRestoringStateRef?.current) return;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveState();
      }, 500);
    };

    timeScale.subscribeVisibleTimeRangeChange(handleTimeRangeChange);
    timeScale.subscribeVisibleLogicalRangeChange(handleTimeRangeChange);

    const checkPriceScaleChange = () => {
      if (isRestoringStateRef?.current) return;

      try {
        const currentOptions = priceScale.options();
        const currentState = JSON.stringify({
          autoScale: currentOptions?.autoScale,
          scaleMargins: currentOptions?.scaleMargins
        });

        if (lastPriceScaleStateRef.current !== currentState) {
          lastPriceScaleStateRef.current = currentState;
          handlePriceScaleChange();
        }
      } catch {
        void 0;
      }
    };

    priceScaleIntervalRef.current = setInterval(checkPriceScaleChange, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (priceScaleIntervalRef.current) {
        clearInterval(priceScaleIntervalRef.current);
        priceScaleIntervalRef.current = null;
      }
      if (chart.current && timeScale) {
        timeScale.unsubscribeVisibleTimeRangeChange(handleTimeRangeChange);
        try {
          timeScale.unsubscribeVisibleLogicalRangeChange(handleTimeRangeChange);
        } catch {
          void 0;
        }
      }
    };
  }, [chart, candlestickSeries, currentSymbolRef, currentIntervalRef, isRestoringStateRef, chartKey]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (priceScaleIntervalRef.current) {
        clearInterval(priceScaleIntervalRef.current);
        priceScaleIntervalRef.current = null;
      }
      lastSavedStateRef.current = null;
      lastPriceScaleStateRef.current = null;
    };
  }, []);
};

