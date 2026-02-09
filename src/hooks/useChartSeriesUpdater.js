import { useCallback } from "react";
import { getLastCandle } from "../services/priceDataStorage";
import { logError } from "../utils/errorHandler";

export const useChartSeriesUpdater = () => {
  const applyVolumeMargins = useCallback((volumeSeries, volumeAreaHeight) => {
    if (!volumeSeries.current) return;

    try {
      volumeSeries.current.applyOptions({
        scaleMargins: {
          top: 1 - volumeAreaHeight,
          bottom: 0,
        },
      });
    } catch (error) {
      logError("applyVolumeMargins", error);
    }
  }, []);

  const applyPriceFormat = useCallback((candlestickSeries, priceFormat) => {
    if (!candlestickSeries.current || !priceFormat) return;

    if (typeof priceFormat.precision !== 'number' || typeof priceFormat.minMove !== 'number') {
      return;
    }

    try {
      candlestickSeries.current.applyOptions({
        priceFormat: {
          type: "price",
          precision: Math.max(0, Math.min(8, priceFormat.precision)),
          minMove: Math.max(0.0000001, Math.min(1, priceFormat.minMove)),
        },
      });
    } catch (error) {
      logError("applyPriceFormat", error);
    }
  }, []);

  const setSeriesData = useCallback((candlestickSeries, volumeSeries, candlestickData, volumeData, lastCandleTimeRef) => {
    if (!candlestickSeries.current || !volumeSeries.current) return false;

    try {
      candlestickSeries.current.setData(candlestickData);
      volumeSeries.current.setData(volumeData);

      if (candlestickData.length > 0) {
        lastCandleTimeRef.current = candlestickData[candlestickData.length - 1].time;
      }

      return true;
    } catch (error) {
      logError("setSeriesData", error);
      return false;
    }
  }, []);

  const updateLastCandleFromStorage = useCallback((candlestickSeries, volumeSeries, currentSymbol, currentInterval, candlestickData) => {
    if (!candlestickSeries.current || !volumeSeries.current) return;

    const storedLastCandle = getLastCandle(currentSymbol, currentInterval);
    if (!storedLastCandle || !storedLastCandle.date || !(storedLastCandle.date instanceof Date)) {
      return;
    }

    const storedTime = storedLastCandle.date.getTime() / 1000;
    const lastDataTime = candlestickData.length > 0 ? candlestickData[candlestickData.length - 1].time : 0;

    if (storedTime < lastDataTime) {
      return;
    }

    try {
      candlestickSeries.current.update({
        time: storedTime,
        open: storedLastCandle.open,
        high: storedLastCandle.high,
        low: storedLastCandle.low,
        close: storedLastCandle.close,
      });

      volumeSeries.current.update({
        time: storedTime,
        value: storedLastCandle.volume || 0,
        color: storedLastCandle.close >= storedLastCandle.open ? "#26a69a80" : "#ef535080",
      });
    } catch (error) {
      logError("updateLastCandleFromStorage", error);
    }
  }, []);

  return {
    applyVolumeMargins,
    applyPriceFormat,
    setSeriesData,
    updateLastCandleFromStorage,
  };
};
