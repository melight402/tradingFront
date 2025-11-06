import { isValidPriceValue } from "../utils/formatters";
import { getTickSizeFromSymbol } from "../utils/tickSizeCache";
import { calculatePriceFormat } from "../utils/formatters";

export const useChartDataProcessor = () => {
  const processChartData = async (data, symbol) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const validData = data.filter((d) => {
      if (!d || !d.date || !(d.date instanceof Date)) {
        return false;
      }
      return isValidPriceValue(d.open) && 
             isValidPriceValue(d.high) && 
             isValidPriceValue(d.low) && 
             isValidPriceValue(d.close) &&
             typeof d.volume === 'number' && 
             isFinite(d.volume) && 
             !isNaN(d.volume) && 
             d.volume >= 0;
    });

    if (validData.length === 0) {
      return null;
    }

    let tickSize = null;
    try {
      tickSize = await getTickSizeFromSymbol(symbol);
    } catch {
      void 0;
      tickSize = null;
    }

    let priceFormat = calculatePriceFormat(validData, tickSize);
    if (!priceFormat || typeof priceFormat.precision !== 'number' || typeof priceFormat.minMove !== 'number') {
      priceFormat = { precision: 2, minMove: 0.01 };
    }

    const candlestickDataMap = new Map();
    validData.forEach((d) => {
      try {
        if (!d || !d.date || !(d.date instanceof Date)) {
          return;
        }
        const time = d.date.getTime() / 1000;
        if (!isFinite(time) || isNaN(time) || time <= 0 || time > 2147483647) {
          return;
        }
        if (!isValidPriceValue(d.open) || !isValidPriceValue(d.high) || 
            !isValidPriceValue(d.low) || !isValidPriceValue(d.close)) {
          return;
        }
        if (d.high < d.low || d.open <= 0 || d.close <= 0) {
          return;
        }
        const candle = {
          time: time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        };
        if (!candlestickDataMap.has(time)) {
          candlestickDataMap.set(time, candle);
        }
      } catch {
      void 0;
        void 0;
      }
    });

    const candlestickData = Array.from(candlestickDataMap.values())
      .sort((a, b) => a.time - b.time);

    for (let i = 1; i < candlestickData.length; i++) {
      const currentCandle = candlestickData[i];
      const previousCandle = candlestickData[i - 1];
      
      if (previousCandle && previousCandle.close !== undefined && typeof previousCandle.close === 'number' && isFinite(previousCandle.close)) {
        currentCandle.open = previousCandle.close;
        if (currentCandle.high < currentCandle.open) {
          currentCandle.high = currentCandle.open;
        }
        if (currentCandle.low > currentCandle.open) {
          currentCandle.low = currentCandle.open;
        }
      }
    }

    const volumeDataMap = new Map();
    validData.forEach((d) => {
      try {
        if (!d || !d.date || !(d.date instanceof Date)) {
          return;
        }
        const time = d.date.getTime() / 1000;
        if (!isFinite(time) || isNaN(time) || time <= 0 || time > 2147483647) {
          return;
        }
        if (typeof d.volume !== 'number' || !isFinite(d.volume) || isNaN(d.volume) || d.volume < 0) {
          return;
        }
        if (!isValidPriceValue(d.close) || !isValidPriceValue(d.open)) {
          return;
        }
        const volume = {
          time: time,
          value: d.volume,
          color: d.close >= d.open ? "#26a69a80" : "#ef535080",
        };
        if (!volumeDataMap.has(time)) {
          volumeDataMap.set(time, volume);
        }
      } catch {
      void 0;
        void 0;
      }
    });

    const volumeData = Array.from(volumeDataMap.values())
      .sort((a, b) => a.time - b.time);

    if (candlestickData.length === 0 || volumeData.length === 0) {
      return null;
    }

    return {
      candlestickData,
      volumeData,
      priceFormat,
    };
  };

  return { processChartData };
};

