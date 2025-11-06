import { useCallback } from "react";
import { isValidPriceValue } from "../utils/formatters";

export const useLastCandleUpdate = (chart, candlestickSeries, volumeSeries, lastCandleTimeRef) => {
  const updateLastCandle = useCallback((lastCandle) => {
    if (!chart.current || !candlestickSeries.current || !volumeSeries.current) {
      return;
    }

    if (!lastCandle || !lastCandle.date || !(lastCandle.date instanceof Date)) {
      return;
    }

    if (!isValidPriceValue(lastCandle.open) || 
        !isValidPriceValue(lastCandle.high) || 
        !isValidPriceValue(lastCandle.low) || 
        !isValidPriceValue(lastCandle.close)) {
      return;
    }

    try {
      const time = lastCandle.date.getTime() / 1000;
      lastCandleTimeRef.current = time;

      candlestickSeries.current.update({
        time: time,
        open: lastCandle.open,
        high: lastCandle.high,
        low: lastCandle.low,
        close: lastCandle.close,
      });

      volumeSeries.current.update({
        time: time,
        value: lastCandle.volume,
        color: lastCandle.close >= lastCandle.open ? "#26a69a80" : "#ef535080",
      });
    } catch {
      void 0;
    }
  }, [chart, candlestickSeries, volumeSeries, lastCandleTimeRef]);

  return { updateLastCandle };
};

