import { useRef, useCallback } from "react";
import { useLastCandleUpdate } from "./useLastCandleUpdate";
import { useChartDataProcessor } from "./useChartDataProcessor";
import { useChartState } from "../contexts/ChartStateContext";
import { useChartDataValidator } from "./useChartDataValidator";
import { useChartSeriesUpdater } from "./useChartSeriesUpdater";
import { useChartStateRestoration } from "./useChartStateRestoration";
import { logError } from "../utils/errorHandler";

export const useChartDataUpdates = (
  chart,
  candlestickSeries,
  volumeSeries,
  volumeDataRef,
  isInitialRender,
  lastCandleTimeRef,
  currentSymbolRef,
  currentIntervalRef,
  isUpdatingDataRef,
  volumeAreaHeight,
  chartKey
) => {
  const { getChartState } = useChartState();
  const hasAppliedStateRef = useRef(false);
  const lastAppliedSymbolRef = useRef(null);
  const lastAppliedIntervalRef = useRef(null);
  const dataUpdateTimeoutRef = useRef(null);
  const { updateLastCandle } = useLastCandleUpdate(chart, candlestickSeries, volumeSeries, lastCandleTimeRef);
  const { processChartData } = useChartDataProcessor();
  const { validateCandleData, validateVolumeData } = useChartDataValidator();
  const { applyVolumeMargins, applyPriceFormat, setSeriesData, updateLastCandleFromStorage } = useChartSeriesUpdater();
  const { applyTimeScale, applyPriceScale, setVisiblePriceRange } = useChartStateRestoration();

  const updateChartData = useCallback(async (data) => {
    if (!chart.current || !candlestickSeries.current || !volumeSeries.current) {
      isUpdatingDataRef.current = false;
      return;
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      isUpdatingDataRef.current = false;
      return;
    }

    const currentSymbol = currentSymbolRef.current;
    const currentInterval = currentIntervalRef.current;

    if (lastAppliedSymbolRef.current !== currentSymbol || lastAppliedIntervalRef.current !== currentInterval) {
      hasAppliedStateRef.current = false;
      lastAppliedSymbolRef.current = currentSymbol;
      lastAppliedIntervalRef.current = currentInterval;
    }

    if (isUpdatingDataRef.current) {
      return;
    }

    isUpdatingDataRef.current = true;

    try {
      const processed = await processChartData(data, currentSymbol);
      if (!processed) {
        isUpdatingDataRef.current = false;
        return;
      }

      const { candlestickData, volumeData, priceFormat } = processed;

      volumeDataRef.current = volumeData;

      requestAnimationFrame(() => {
        if (!chart.current || !candlestickSeries.current || !volumeSeries.current) {
          isUpdatingDataRef.current = false;
          return;
        }

        if (currentSymbolRef.current !== currentSymbol || currentIntervalRef.current !== currentInterval) {
          isUpdatingDataRef.current = false;
          return;
        }

        try {
          applyVolumeMargins(volumeSeries, volumeAreaHeight);
          applyPriceFormat(candlestickSeries, priceFormat);

          if (!validateCandleData(candlestickData) || !validateVolumeData(volumeData)) {
            isUpdatingDataRef.current = false;
            return;
          }

          if (!setSeriesData(candlestickSeries, volumeSeries, candlestickData, volumeData, lastCandleTimeRef)) {
            isUpdatingDataRef.current = false;
            return;
          }

          updateLastCandleFromStorage(candlestickSeries, volumeSeries, currentSymbol, currentInterval, candlestickData);

          if (isInitialRender.current && !hasAppliedStateRef.current && candlestickData.length > 0) {
            hasAppliedStateRef.current = true;
            isInitialRender.current = false;

            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (!chart.current || !candlestickSeries.current) {
                  isUpdatingDataRef.current = false;
                  return;
                }

                if (currentSymbolRef.current !== currentSymbol || currentIntervalRef.current !== currentInterval) {
                  isUpdatingDataRef.current = false;
                  return;
                }

                const savedState = chartKey
                  ? getChartState(chartKey, currentSymbol, currentInterval)
                  : null;

                if (savedState) {
                  const timeScale = chart.current.timeScale();
                  const priceScale = chart.current.priceScale('right');

                  if (timeScale) {
                    applyTimeScale(timeScale, savedState);
                  }

                  if (priceScale && savedState.priceScale) {
                    const priceRangeData = applyPriceScale(priceScale, savedState, candlestickData);

                    if (priceRangeData) {
                      requestAnimationFrame(() => {
                        if (chart.current && priceScale &&
                            currentSymbolRef.current === currentSymbol && currentIntervalRef.current === currentInterval) {
                          setVisiblePriceRange(priceScale, priceRangeData);
                        }
                        isUpdatingDataRef.current = false;
                      });
                      return;
                    }
                  }
                }

                isUpdatingDataRef.current = false;
              });
            });
          } else {
            isUpdatingDataRef.current = false;
            if (isInitialRender.current) {
              isInitialRender.current = false;
            }
          }
        } catch (error) {
          logError("updateChartData requestAnimationFrame", error);
          isUpdatingDataRef.current = false;
        }
      });
    } catch (error) {
      logError("updateChartData", error);
      isUpdatingDataRef.current = false;
    }
  }, [chart, candlestickSeries, volumeSeries, volumeDataRef, isInitialRender, lastCandleTimeRef, currentSymbolRef, currentIntervalRef, isUpdatingDataRef, volumeAreaHeight, chartKey, processChartData, getChartState, validateCandleData, validateVolumeData, applyVolumeMargins, applyPriceFormat, setSeriesData, updateLastCandleFromStorage, applyTimeScale, applyPriceScale, setVisiblePriceRange]);

  return { updateLastCandle, updateChartData, dataUpdateTimeoutRef };
};
