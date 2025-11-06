import { useCallback, useRef } from "react";
import { setHorizontalScale, addRightPadding } from "../utils/chartHelpers";
import { useChartState } from "../contexts/ChartStateContext";

export const useChartScaleSetup = (chart, candlestickSeries, volumeAreaHeight, currentSymbolRef, currentIntervalRef, isRestoringStateRef, chartKey) => {
  const { getChartState } = useChartState();
  const hasRestoredStateRef = useRef(false);
  
  const setupInitialScale = useCallback((candlestickData, interval) => {
    if (!chart.current || !candlestickSeries.current) {
      return;
    }

    if (hasRestoredStateRef.current) {
      return;
    }

    const timeScale = chart.current?.timeScale();
    const priceScale = chart.current?.priceScale('right');
    
    if (timeScale && currentSymbolRef?.current && currentIntervalRef?.current && chartKey) {
      const savedState = getChartState(chartKey, currentSymbolRef.current, currentIntervalRef.current);
      
      if (savedState) {
        requestAnimationFrame(() => {
          if (!chart.current || !timeScale) {
            return;
          }
          
          try {
            isRestoringStateRef.current = true;
            
            if (savedState.logicalRange && savedState.logicalRange.from != null && savedState.logicalRange.to != null) {
              timeScale.setVisibleLogicalRange(savedState.logicalRange);
            } else if (savedState.timeRange && savedState.timeRange.from != null && savedState.timeRange.to != null) {
              timeScale.setVisibleRange(savedState.timeRange);
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
                  requestAnimationFrame(() => {
                    try {
                      if (chart.current && priceScale) {
                        priceScale.applyOptions({
                          autoScale: false,
                          scaleMargins: savedState.priceScale.scaleMargins || {
                            top: 0.1,
                            bottom: volumeAreaHeight
                          }
                        });
                        
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
                        });
                      }
                    } catch {
      void 0;
                      void 0;
                    }
                  });
                });
              } else if (!savedState.priceScale.autoScale) {
                requestAnimationFrame(() => {
                  try {
                    if (chart.current && priceScale) {
                      priceScale.applyOptions({
                        autoScale: false,
                        scaleMargins: savedState.priceScale.scaleMargins || {
                          top: 0.1,
                          bottom: volumeAreaHeight
                        }
                      });
                    }
                  } catch {
      void 0;
                    void 0;
                  }
                });
              }
            }
            
            setTimeout(() => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  if (chart.current && candlestickSeries.current) {
                    addRightPadding(chart.current, candlestickSeries.current, 100);
                  }
                  requestAnimationFrame(() => {
                    if (chart.current) {
                      isRestoringStateRef.current = false;
                      hasRestoredStateRef.current = true;
                    }
                  });
                });
              });
            }, 500);
          } catch {
      void 0;
            const candleCount = interval === '5m' ? 120 : 50;
            setHorizontalScale(chart.current, candleCount, candlestickData, 100);
            isRestoringStateRef.current = false;
            hasRestoredStateRef.current = true;
          }
        });
        return;
      }
    }

    const savedState = currentSymbolRef?.current && currentIntervalRef?.current && chartKey
      ? getChartState(chartKey, currentSymbolRef.current, currentIntervalRef.current)
      : null;

    if (!savedState) {
      requestAnimationFrame(() => {
        if (!chart.current || !candlestickSeries.current) {
          return;
        }

        const rightPriceScale = chart.current.priceScale("right");
        if (rightPriceScale) {
          rightPriceScale.applyOptions({
            visible: true,
            autoScale: true,
          });
        }
      });
      hasRestoredStateRef.current = true;
      return;
    }

    const candleCount = interval === '5m' ? 120 : 50;
    setHorizontalScale(chart.current, candleCount, candlestickData, 100);
    hasRestoredStateRef.current = true;

    requestAnimationFrame(() => {
      if (!chart.current || !candlestickSeries.current) {
        return;
      }

      const rightPriceScale = chart.current.priceScale("right");
      if (rightPriceScale) {
        if (savedState && savedState.priceScale && savedState.priceScale.autoScale === false) {
          rightPriceScale.applyOptions({
            visible: true,
            autoScale: false,
            scaleMargins: savedState.priceScale.scaleMargins || {
              top: 0.1,
              bottom: volumeAreaHeight
            }
          });
        } else {
          rightPriceScale.applyOptions({
            visible: true,
            autoScale: true,
          });
        }
      }
    });
  }, [chart, candlestickSeries, volumeAreaHeight, currentSymbolRef, currentIntervalRef, isRestoringStateRef, chartKey, getChartState]);

  const setupPriceScales = useCallback(() => {
    if (!chart.current) {
      return;
    }

    const savedState = currentSymbolRef?.current && currentIntervalRef?.current && chartKey
      ? getChartState(chartKey, currentSymbolRef.current, currentIntervalRef.current)
      : null;

    const savedScaleMargins = savedState?.priceScale?.scaleMargins;
    const savedAutoScale = savedState?.priceScale?.autoScale;

    chart.current.applyOptions({
      rightPriceScale: {
        visible: true,
        autoScale: savedAutoScale !== undefined ? savedAutoScale : true,
        scaleMargins: savedScaleMargins || {
          top: 0.1,
          bottom: volumeAreaHeight,
        },
      },
      leftPriceScale: {
        visible: false,
        scaleMargins: {
          top: 1 - volumeAreaHeight,
          bottom: 0,
        },
        autoScale: true,
      },
    });

    const leftPriceScale = chart.current.priceScale("left");
    if (leftPriceScale) {
      leftPriceScale.applyOptions({
        scaleMargins: {
          top: 1 - volumeAreaHeight,
          bottom: 0,
        },
        autoScale: true,
      });
    }
  }, [chart, volumeAreaHeight, currentSymbolRef, currentIntervalRef, chartKey, getChartState]);

  return { setupInitialScale, setupPriceScales };
};

