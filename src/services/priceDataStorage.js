const currentPrices = new Map();
const lastCandleData = new Map();

export const setCurrentPrice = (symbol, price) => {
  currentPrices.set(symbol, price);
};

export const getCurrentPrice = (symbol) => {
  return currentPrices.get(symbol) || null;
};

export const deleteCurrentPrice = (symbol) => {
  currentPrices.delete(symbol);
};

export const setLastCandle = (symbol, interval, candle) => {
  if (!lastCandleData.has(symbol)) {
    lastCandleData.set(symbol, new Map());
  }
  lastCandleData.get(symbol).set(interval, candle);
};

export const getLastCandle = (symbol, interval) => {
  const candlesMap = lastCandleData.get(symbol);
  return candlesMap ? candlesMap.get(interval) : null;
};

export const getCandlesMap = (symbol) => {
  return lastCandleData.get(symbol);
};

export const deleteCandlesMap = (symbol) => {
  lastCandleData.delete(symbol);
};

export const initializeCandlesMap = (symbol, intervalsArray, candleDataArray) => {
  const candlesMap = new Map();
  intervalsArray.forEach((interval, index) => {
    if (candleDataArray[index]) {
      candlesMap.set(interval, candleDataArray[index]);
    }
  });
  lastCandleData.set(symbol, candlesMap);
};

