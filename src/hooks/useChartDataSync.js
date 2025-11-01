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

  useEffect(() => {
    if (!loaded) {
      return;
    }

    if (!data || !data.length || !chart.current || !candlestickSeries.current || !volumeSeries.current) {
      return;
    }

    if (currentSymbolRef.current !== symbol || currentIntervalRef.current !== interval) {
      return;
    }

    if (data.length < 1) {
      return;
    }

    if (dataUpdateTimeoutRef.current) {
      clearTimeout(dataUpdateTimeoutRef.current);
    }

    dataUpdateTimeoutRef.current = setTimeout(() => {
      if (currentSymbolRef.current === symbol && currentIntervalRef.current === interval && 
          chart.current && candlestickSeries.current && volumeSeries.current && 
          data && Array.isArray(data) && data.length >= 1) {
        updateChartData(data);
      }
      
      if (currentSymbolRef.current === symbol && currentIntervalRef.current === interval) {
        restoreLineTools(data, loaded, updateChartData);
      }
    }, 0);

    return () => {
      if (dataUpdateTimeoutRef.current) {
        clearTimeout(dataUpdateTimeoutRef.current);
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

