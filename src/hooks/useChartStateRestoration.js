import { useCallback } from "react";
import { logError } from "../utils/errorHandler";

export const useChartStateRestoration = () => {
  const isRangeSimilar = useCallback((dataRange, savedRange, minPrice, maxPrice, savedMin, savedMax) => {
    if (dataRange <= 0 || savedRange <= 0) return false;

    const rangeRatio = Math.max(dataRange / savedRange, savedRange / dataRange);
    const minDiff = Math.abs(savedMin - minPrice) / Math.max(Math.abs(minPrice), 1);
    const maxDiff = Math.abs(savedMax - maxPrice) / Math.max(Math.abs(maxPrice), 1);

    return rangeRatio <= 10 && minDiff <= 5 && maxDiff <= 5;
  }, []);

  const applyTimeScale = useCallback((timeScale, savedState) => {
    if (!timeScale || !savedState) return;

    try {
      if (savedState.logicalRange && savedState.logicalRange.from != null && savedState.logicalRange.to != null) {
        timeScale.setVisibleLogicalRange(savedState.logicalRange);
      } else if (savedState.timeRange && savedState.timeRange.from != null && savedState.timeRange.to != null) {
        timeScale.setVisibleRange(savedState.timeRange);
      }
    } catch (error) {
      logError("applyTimeScale", error);
    }
  }, []);

  const applyPriceScale = useCallback((priceScale, savedState, candlestickData) => {
    if (!priceScale || !savedState || !candlestickData.length) return false;

    try {
      const minPrice = Math.min(...candlestickData.map(d => Math.min(d.low, d.open, d.close, d.high)));
      const maxPrice = Math.max(...candlestickData.map(d => Math.max(d.high, d.open, d.close, d.low)));
      const dataRange = maxPrice - minPrice;

      let shouldApplyPriceRange = false;
      if (!savedState.priceScale.autoScale && savedState.priceRange &&
          savedState.priceRange.from !== null && savedState.priceRange.to !== null) {
        const savedMin = Math.min(savedState.priceRange.from, savedState.priceRange.to);
        const savedMax = Math.max(savedState.priceRange.from, savedState.priceRange.to);
        const savedRange = savedMax - savedMin;

        shouldApplyPriceRange = isRangeSimilar(dataRange, savedRange, minPrice, maxPrice, savedMin, savedMax);
      }

      const options = {};
      if (savedState.priceScale.autoScale !== undefined) {
        options.autoScale = shouldApplyPriceRange ? false : savedState.priceScale.autoScale;
      }
      if (savedState.priceScale.scaleMargins) {
        options.scaleMargins = savedState.priceScale.scaleMargins;
      }

      if (Object.keys(options).length > 0) {
        priceScale.applyOptions(options);
      }

      return shouldApplyPriceRange ? { savedMin: Math.min(savedState.priceRange.from, savedState.priceRange.to), savedMax: Math.max(savedState.priceRange.from, savedState.priceRange.to) } : null;
    } catch (error) {
      logError("applyPriceScale", error);
      return null;
    }
  }, [isRangeSimilar]);

  const setVisiblePriceRange = useCallback((priceScale, priceRange) => {
    if (!priceScale || !priceRange) return;

    try {
      priceScale.setVisibleRange({
        minValue: priceRange.savedMin,
        maxValue: priceRange.savedMax,
      });
    } catch (error) {
      logError("setVisiblePriceRange", error);
    }
  }, []);

  return {
    applyTimeScale,
    applyPriceScale,
    setVisiblePriceRange,
  };
};
