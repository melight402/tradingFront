import { useEffect, useRef } from "react";
import { loadChartState } from "../services/chartStateStorage";

export const useVolumeScaleSync = (chart, volumeSeries, volumeDataRef, volumeAreaHeight, isRestoringStateRef, candlestickSeries, currentSymbolRef, currentIntervalRef, chartKey) => {
  const timeRangeChangeHandlerRef = useRef(null);

  useEffect(() => {
    if (!chart.current || !volumeDataRef.current.length) return;

    const updateVolumeScale = () => {
      if (!chart.current || !volumeDataRef.current.length) return;
      if (isRestoringStateRef?.current) return;
      
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
          ? loadChartState(chartKey, currentSymbolRef.current, currentIntervalRef.current)
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
        
        if (needsUpdate) {
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
    const handler = () => {
      requestAnimationFrame(() => {
        updateVolumeScale();
      });
    };
    
    timeRangeChangeHandlerRef.current = handler;
    timeScale.subscribeVisibleTimeRangeChange(handler);
    
    setTimeout(() => {
      updateVolumeScale();
    }, 200);

    return () => {
      if (chart.current) {
        const timeScale = chart.current.timeScale();
        if (timeRangeChangeHandlerRef.current && timeScale) {
          timeScale.unsubscribeVisibleTimeRangeChange(timeRangeChangeHandlerRef.current);
        }
      }
    };
  }, [chart, volumeSeries, volumeDataRef, volumeAreaHeight, isRestoringStateRef, candlestickSeries, currentSymbolRef, currentIntervalRef, chartKey]);
};

