import { useRef, useCallback } from "react";
import { useLastCandleUpdate } from "./useLastCandleUpdate";
import { useChartDataProcessor } from "./useChartDataProcessor";
import { useChartState } from "../contexts/ChartStateContext";
import { getLastCandle } from "../services/priceDataStorage";

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
  const dataUpdateTimeoutRef = useRef(null);
  const { updateLastCandle } = useLastCandleUpdate(chart, candlestickSeries, volumeSeries, lastCandleTimeRef);
  const { processChartData } = useChartDataProcessor();

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
            volumeSeries.current.applyOptions({
              scaleMargins: {
                top: 1 - volumeAreaHeight,
                bottom: 0,
              },
            });
          

          if (priceFormat && typeof priceFormat.precision === 'number' && typeof priceFormat.minMove === 'number') {
            candlestickSeries.current.applyOptions({
              priceFormat: {
                type: "price",
                precision: Math.max(0, Math.min(8, priceFormat.precision)),
                minMove: Math.max(0.0000001, Math.min(1, priceFormat.minMove)),
              },
            });
          }

          if (candlestickData.length > 0 && candlestickData.every(d => 
            d && typeof d.time === 'number' && isFinite(d.time) &&
            typeof d.open === 'number' && isFinite(d.open) &&
            typeof d.high === 'number' && isFinite(d.high) &&
            typeof d.low === 'number' && isFinite(d.low) &&
            typeof d.close === 'number' && isFinite(d.close)
          )) {
            candlestickSeries.current.setData(candlestickData);
          } else {
            isUpdatingDataRef.current = false;
            return;
          }

          if (volumeData.length > 0 && volumeData.every(d => 
            d && typeof d.time === 'number' && isFinite(d.time) &&
            typeof d.value === 'number' && isFinite(d.value)
          )) {
            volumeSeries.current.setData(volumeData);
          } else {
            isUpdatingDataRef.current = false;
            return;
          }

          if (candlestickData.length > 0) {
            lastCandleTimeRef.current = candlestickData[candlestickData.length - 1].time;
          }

          const storedLastCandle = getLastCandle(currentSymbol, currentInterval);
          if (storedLastCandle && storedLastCandle.date && storedLastCandle.date instanceof Date) {
            const storedTime = storedLastCandle.date.getTime() / 1000;
            const lastDataTime = candlestickData.length > 0 ? candlestickData[candlestickData.length - 1].time : 0;
            
            if (storedTime >= lastDataTime) {
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

                lastCandleTimeRef.current = storedTime;
              } catch {
      void 0;
                void 0;
              }
            }
          }

          if (isInitialRender.current && !hasAppliedStateRef.current && candlestickData.length > 0) {
            hasAppliedStateRef.current = true;
            isInitialRender.current = false;
            
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (!chart.current || !candlestickSeries.current) {
                  isUpdatingDataRef.current = false;
                  return;
                }
                
                const savedState = currentSymbolRef?.current && currentIntervalRef?.current && chartKey
                  ? getChartState(chartKey, currentSymbolRef.current, currentIntervalRef.current)
                  : null;
                
                if (savedState) {
                  const timeScale = chart.current.timeScale();
                  const priceScale = chart.current.priceScale('right');
                  
                  if (timeScale) {
                    if (savedState.logicalRange && savedState.logicalRange.from != null && savedState.logicalRange.to != null) {
                      timeScale.setVisibleLogicalRange(savedState.logicalRange);
                    } else if (savedState.timeRange && savedState.timeRange.from != null && savedState.timeRange.to != null) {
                      timeScale.setVisibleRange(savedState.timeRange);
                    }
                  }
                  
                  if (priceScale && savedState.priceScale) {
                    const options = {};
                    if (savedState.priceScale.autoScale !== undefined) {
                      options.autoScale = savedState.priceScale.autoScale;
                    }
                    if (savedState.priceScale.scaleMargins) {
                      options.scaleMargins = savedState.priceScale.scaleMargins;
                    }
                    
                    if (Object.keys(options).length > 0) {
                      priceScale.applyOptions(options);
                    }
                    
                    if (!savedState.priceScale.autoScale && savedState.priceRange && 
                        savedState.priceRange.from !== null && savedState.priceRange.to !== null) {
                      requestAnimationFrame(() => {
                        if (chart.current && priceScale) {
                          try {
                            priceScale.setVisibleRange({
                              minValue: Math.min(savedState.priceRange.from, savedState.priceRange.to),
                              maxValue: Math.max(savedState.priceRange.from, savedState.priceRange.to)
                            });
                          } catch {
      void 0;
                            void 0;
                          }
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
        } catch {
      void 0;
          isUpdatingDataRef.current = false;
        }
      });
    } catch {
      void 0;
      isUpdatingDataRef.current = false;
    }
  }, [chart, candlestickSeries, volumeSeries, volumeDataRef, isInitialRender, lastCandleTimeRef, currentSymbolRef, currentIntervalRef, isUpdatingDataRef, volumeAreaHeight, chartKey, processChartData, getChartState]);

  return { updateLastCandle, updateChartData, dataUpdateTimeoutRef };
};
