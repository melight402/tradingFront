export const setHorizontalScale = (chart, candleCount, candlestickData) => {
  if (!chart) return;
  
  try {
    const timeScale = chart.timeScale();
    if (!timeScale || !candlestickData || candlestickData.length === 0) return;
    
    const lastCandleTime = candlestickData[candlestickData.length - 1].time;
    const firstCandleTime = candlestickData[Math.max(0, candlestickData.length - candleCount)].time;
    
    timeScale.setVisibleRange({
      from: firstCandleTime,
      to: lastCandleTime
    });
  } catch {
    void 0;
  }
};

export const setVerticalScale = (chart, candlestickData) => {
  if (!chart || !candlestickData || candlestickData.length === 0) return;
  
  try {
    const priceScale = chart.priceScale("right");
    if (!priceScale) return;
    
    const lastCandle = candlestickData[candlestickData.length - 1];
    if (!lastCandle || typeof lastCandle.high !== 'number' || typeof lastCandle.low !== 'number') {
      return;
    }
    
    const candleHeight = lastCandle.high - lastCandle.low;
    
    if (candleHeight <= 0) {
      return;
    }
    
    priceScale.applyOptions({
      autoScale: true,
    });
  } catch {
    void 0;
  }
};

export const addRightPadding = (chart, candlestickSeries, paddingPx = 100) => {
  if (!chart || !candlestickSeries) return;
  
  try {
    const timeScale = chart.timeScale();
    if (!timeScale) return;
    
    const logicalRange = timeScale.getVisibleLogicalRange();
    if (!logicalRange || logicalRange.from == null || logicalRange.to == null) {
      return;
    }
    
    const chartWidth = timeScale.width();
    if (!chartWidth || chartWidth <= paddingPx) {
      return;
    }
    
    const targetCoord = chartWidth - paddingPx;
    
    const leftCoord = timeScale.logicalToCoordinate(logicalRange.from);
    const rightCoord = timeScale.logicalToCoordinate(logicalRange.to);
    
    if (leftCoord === null || leftCoord === undefined || 
        rightCoord === null || rightCoord === undefined) {
      return;
    }
    
    if (rightCoord <= targetCoord) {
      return;
    }
    
    const rangeWidth = logicalRange.to - logicalRange.from;
    const coordWidth = rightCoord - leftCoord;
    
    if (coordWidth === 0) {
      return;
    }
    
    const pixelsPerLogical = coordWidth / rangeWidth;
    
    const pixelShift = rightCoord - targetCoord;
    
    const logicalShift = pixelShift / pixelsPerLogical;
    
    timeScale.setVisibleLogicalRange({
      from: logicalRange.from,
      to: logicalRange.to + logicalShift
    });
  } catch {
    void 0;
  }
};
