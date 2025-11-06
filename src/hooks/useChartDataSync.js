import { useEffect, useRef } from "react";

export const useChartDataSync = (
  chart,
  candlestickSeries,
  volumeSeries,
  data,
  loaded,
  symbol,
  interval,
  currentSymbolRef,
  currentIntervalRef,
  dataUpdateTimeoutRef,
  updateChartData,
  restoreLineTools,
  setOnLastCandleUpdate,
  updateLastCandle
) => {
  const callbackSymbolRef = useRef(null);
  const callbackIntervalRef = useRef(null);

  const dataRef = useRef(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    dataRef.current = data;
    loadedRef.current = loaded;
  }, [data, loaded]);

  useEffect(() => {
    if (!loadedRef.current) {
      return;
    }

    const currentData = dataRef.current;
    if (!currentData || !Array.isArray(currentData) || currentData.length === 0) {
      return;
    }

    if (!chart.current || !candlestickSeries.current || !volumeSeries.current) {
      return;
    }

    if (currentSymbolRef.current !== symbol || currentIntervalRef.current !== interval) {
      return;
    }

    if (dataUpdateTimeoutRef.current) {
      clearTimeout(dataUpdateTimeoutRef.current);
    }

    dataUpdateTimeoutRef.current = setTimeout(() => {
      const latestData = dataRef.current;
      if (!latestData || !Array.isArray(latestData) || latestData.length === 0) {
        return;
      }

      if (currentSymbolRef.current !== symbol || currentIntervalRef.current !== interval) {
        return;
      }

      if (!chart.current || !candlestickSeries.current || !volumeSeries.current) {
        return;
      }

      if (loadedRef.current) {
        updateChartData(latestData);
      }
      
      if (currentSymbolRef.current === symbol && currentIntervalRef.current === interval && loadedRef.current) {
        restoreLineTools(latestData, loadedRef.current, updateChartData);
      }
    }, 0);

    return () => {
      if (dataUpdateTimeoutRef.current) {
        clearTimeout(dataUpdateTimeoutRef.current);
        dataUpdateTimeoutRef.current = null;
      }
    };
  }, [data, loaded, updateChartData, symbol, interval, restoreLineTools, chart, candlestickSeries, volumeSeries, currentSymbolRef, currentIntervalRef, dataUpdateTimeoutRef]);

  useEffect(() => {
    if (!chart.current || !candlestickSeries.current || !volumeSeries.current) {
      return;
    }

    if (currentSymbolRef.current === symbol && currentIntervalRef.current === interval) {
      callbackSymbolRef.current = symbol;
      callbackIntervalRef.current = interval;
      setOnLastCandleUpdate(updateLastCandle);
    }

    return () => {
      setOnLastCandleUpdate(null);
      callbackSymbolRef.current = null;
      callbackIntervalRef.current = null;
    };
  }, [symbol, interval, setOnLastCandleUpdate, updateLastCandle, chart, candlestickSeries, volumeSeries, currentSymbolRef, currentIntervalRef]);
};

