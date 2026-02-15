import { useRef, useCallback } from "react";

export const useLastCandleFollow = (chart, candlestickSeries, chartContainerRef, chartKey, isTopChart) => {
  const lastCheckTimeRef = useRef(null);
  const userInteractionRef = useRef(false);
  const interactionTimeoutRef = useRef(null);

  const checkAndFollowLastCandle = useCallback((lastCandle) => {
    if (!isTopChart || chartKey !== "chart5m") {
      return;
    }

    if (!chart.current || !candlestickSeries.current || !lastCandle) {
      return;
    }

    if (!lastCandle.date || !(lastCandle.date instanceof Date)) {
      return;
    }

    if (userInteractionRef.current) {
      return;
    }

    try {
      const timeScale = chart.current.timeScale();
      const priceScale = chart.current.priceScale('right');
      
      if (!timeScale || !priceScale) {
        return;
      }

      const lastCandleTime = lastCandle.date.getTime() / 1000;
      const now = Date.now() / 1000;
      
      if (lastCheckTimeRef.current && (now - lastCheckTimeRef.current) < 0.1) {
        return;
      }
      lastCheckTimeRef.current = now;

      const visibleTimeRange = timeScale.getVisibleRange();
      if (!visibleTimeRange || visibleTimeRange.from == null || visibleTimeRange.to == null) {
        return;
      }

      const timePadding = (visibleTimeRange.to - visibleTimeRange.from) * 0.1;
      const isTimeVisible = lastCandleTime >= (visibleTimeRange.from - timePadding) && 
                           lastCandleTime <= (visibleTimeRange.to + timePadding);

      const visiblePriceRange = priceScale.getVisibleRange();
      if (!visiblePriceRange || visiblePriceRange.minValue == null || visiblePriceRange.maxValue == null) {
        return;
      }

      const pricePadding = (visiblePriceRange.maxValue - visiblePriceRange.minValue) * 0.05;
      const isPriceVisible = (lastCandle.low >= (visiblePriceRange.minValue - pricePadding)) && 
                             (lastCandle.high <= (visiblePriceRange.maxValue + pricePadding));

      if (!isTimeVisible) {
        requestAnimationFrame(() => {
          try {
            if (!chart.current || !timeScale) {
              return;
            }

            const logicalRange = timeScale.getVisibleLogicalRange();
            if (!logicalRange || logicalRange.from == null || logicalRange.to == null) {
              return;
            }

            const rangeWidth = logicalRange.to - logicalRange.from;
            const lastCandleCoord = timeScale.timeToCoordinate(lastCandleTime);
            const rightCoord = timeScale.logicalToCoordinate(logicalRange.to);
            
            if (lastCandleCoord === null || lastCandleCoord === undefined || 
                rightCoord === null || rightCoord === undefined) {
              return;
            }

            const chartWidth = timeScale.width();
            if (!chartWidth || chartWidth <= 0) {
              return;
            }

            const rightPadding = chartWidth * 0.1;
            const targetRightCoord = chartWidth - rightPadding;

            if (lastCandleCoord > targetRightCoord || lastCandleCoord < 0) {
              const coordWidth = rightCoord - timeScale.logicalToCoordinate(logicalRange.from);
              
              if (coordWidth > 0) {
                const pixelsPerLogical = coordWidth / rangeWidth;
                const pixelShift = lastCandleCoord - targetRightCoord;
                const logicalShift = pixelShift / pixelsPerLogical;

                timeScale.setVisibleLogicalRange({
                  from: logicalRange.from + logicalShift,
                  to: logicalRange.to + logicalShift
                });
              }
            }
          } catch {
          }
        });
      }

      if (!isPriceVisible) {
        requestAnimationFrame(() => {
          try {
            if (!chart.current || !priceScale) {
              return;
            }

            const currentOptions = priceScale.options();
            if (currentOptions && currentOptions.autoScale === false) {
              const currentRange = priceScale.getVisibleRange();
              if (currentRange && currentRange.minValue != null && currentRange.maxValue != null) {
                const newMin = Math.min(currentRange.minValue, lastCandle.low);
                const newMax = Math.max(currentRange.maxValue, lastCandle.high);
                const padding = (newMax - newMin) * 0.1;
                
                priceScale.setVisibleRange({
                  minValue: newMin - padding,
                  maxValue: newMax + padding
                });
              }
            } else {
              priceScale.applyOptions({ autoScale: true });
            }
          } catch {
          }
        });
      }
    } catch {
    }
  }, [chart, candlestickSeries, chartKey, isTopChart]);

  const handleUserInteraction = useCallback(() => {
    userInteractionRef.current = true;
    
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    
    interactionTimeoutRef.current = setTimeout(() => {
      userInteractionRef.current = false;
    }, 5000);
  }, []);

  const setupUserInteractionListeners = useCallback(() => {
    if (!chart.current || !chartContainerRef?.current || !isTopChart || chartKey !== "chart5m") {
      return;
    }

    const chartElement = chartContainerRef.current;
    if (!chartElement) {
      return;
    }

    const handleWheel = () => handleUserInteraction();
    const handleMouseDown = () => handleUserInteraction();
    const handleTouchStart = () => handleUserInteraction();

    chartElement.addEventListener('wheel', handleWheel);
    chartElement.addEventListener('mousedown', handleMouseDown);
    chartElement.addEventListener('touchstart', handleTouchStart);

    return () => {
      chartElement.removeEventListener('wheel', handleWheel);
      chartElement.removeEventListener('mousedown', handleMouseDown);
      chartElement.removeEventListener('touchstart', handleTouchStart);
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, [chart, chartContainerRef, isTopChart, chartKey, handleUserInteraction]);

  return { checkAndFollowLastCandle, setupUserInteractionListeners };
};

