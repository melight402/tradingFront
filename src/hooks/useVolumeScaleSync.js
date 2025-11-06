import { useEffect } from "react";

export const useVolumeScaleSync = (chart, volumeSeries, volumeDataRef, volumeAreaHeight) => {
  useEffect(() => {
    if (!chart.current || !volumeDataRef.current.length) return;

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
  }, [chart, volumeSeries, volumeDataRef, volumeAreaHeight]);
};

