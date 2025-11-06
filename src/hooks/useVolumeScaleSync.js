import { useEffect, useRef } from "react";
import { useChartState } from "../contexts/ChartStateContext";

export const useVolumeScaleSync = (chart, volumeSeries, volumeDataRef, volumeAreaHeight, isRestoringStateRef, candlestickSeries, currentSymbolRef, currentIntervalRef, chartKey, chartContainerRef) => {
  const { getChartState } = useChartState();
  const timeRangeChangeHandlerRef = useRef(null);
  const isUserInteractingRef = useRef(false);
  const updateTimeoutRef = useRef(null);

  useEffect(() => {
    if (!chart.current || !volumeDataRef.current.length) return;

    const updateVolumeScale = () => {
      if (!chart.current || !volumeDataRef.current.length) return;
      if (isRestoringStateRef?.current) return;
      if (isUserInteractingRef.current) return;
      
      const volumeTop = 1 - volumeAreaHeight;
      
      if (volumeSeries.current) {
        volumeSeries.current.applyOptions({
          scaleMargins: {
            top: volumeTop,
            bottom: 0,
          },
        });
      }
      
      const leftPriceScale = chart.current.priceScale("left");
      if (leftPriceScale) {
        leftPriceScale.applyOptions({
          visible: false,
          scaleMargins: {
            top: volumeTop,
            bottom: 0,
          },
          autoScale: true,
          entireTextOnly: false,
        });
      }
      
      const rightPriceScale = chart.current.priceScale("right");
      if (rightPriceScale) {
        const currentOptions = rightPriceScale.options();
        const savedState = currentSymbolRef?.current && currentIntervalRef?.current && chartKey
          ? getChartState(chartKey, currentSymbolRef.current, currentIntervalRef.current)
          : null;
        
        const savedScaleMargins = savedState?.priceScale?.scaleMargins;
        const savedAutoScale = savedState?.priceScale?.autoScale;
        
        const needsUpdate = 
          !currentOptions ||
          (savedScaleMargins && (
            currentOptions.scaleMargins?.top !== savedScaleMargins.top ||
            currentOptions.scaleMargins?.bottom !== savedScaleMargins.bottom
          )) ||
          (savedAutoScale !== undefined && currentOptions.autoScale !== savedAutoScale);
        
        if (needsUpdate && !isUserInteractingRef.current) {
          rightPriceScale.applyOptions({
            visible: true,
            scaleMargins: savedScaleMargins || {
              top: 0.1,
              bottom: volumeAreaHeight,
            },
            autoScale: savedAutoScale !== undefined ? savedAutoScale : (currentOptions?.autoScale ?? true),
          });
        }
      }
    };

    const timeScale = chart.current.timeScale();
    
    const handleMouseDown = () => {
      isUserInteractingRef.current = true;
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
    
    const handleMouseUp = () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => {
        isUserInteractingRef.current = false;
      }, 300);
    };
    
    const handler = () => {
      if (isUserInteractingRef.current) return;
      
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      updateTimeoutRef.current = setTimeout(() => {
        if (!isUserInteractingRef.current) {
          requestAnimationFrame(() => {
            updateVolumeScale();
          });
        }
      }, 100);
    };
    
    timeRangeChangeHandlerRef.current = handler;
    timeScale.subscribeVisibleTimeRangeChange(handler);
    
    const containerElement = chartContainerRef?.current;
    if (containerElement) {
      containerElement.addEventListener('mousedown', handleMouseDown);
      containerElement.addEventListener('mouseup', handleMouseUp);
      containerElement.addEventListener('touchstart', handleMouseDown);
      containerElement.addEventListener('touchend', handleMouseUp);
    }
    
    setTimeout(() => {
      updateVolumeScale();
    }, 200);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (chart.current) {
        const timeScale = chart.current.timeScale();
        if (timeRangeChangeHandlerRef.current && timeScale) {
          timeScale.unsubscribeVisibleTimeRangeChange(timeRangeChangeHandlerRef.current);
        }
      }
      if (containerElement) {
        containerElement.removeEventListener('mousedown', handleMouseDown);
        containerElement.removeEventListener('mouseup', handleMouseUp);
        containerElement.removeEventListener('touchstart', handleMouseDown);
        containerElement.removeEventListener('touchend', handleMouseUp);
      }
    };
  }, [chart, volumeSeries, volumeDataRef, volumeAreaHeight, isRestoringStateRef, candlestickSeries, currentSymbolRef, currentIntervalRef, chartKey, getChartState, chartContainerRef]);
};

