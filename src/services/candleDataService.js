import { fetchWithRetry } from "../utils/fetchWithRetry";

export const fetchLastCandleForInterval = async (symbol, interval) => {
  try {
    const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=1`;
    const klineData = await fetchWithRetry(url, 3, 1000);
    
    if (klineData.length > 0) {
      return {
        date: new Date(klineData[0][0]),
        open: parseFloat(klineData[0][1]),
        high: parseFloat(klineData[0][2]),
        low: parseFloat(klineData[0][3]),
        close: parseFloat(klineData[0][4]),
        volume: parseFloat(klineData[0][5]),
      };
    }
    return null;
  } catch (err) {
    if (err.name !== 'AbortError') {
      void 0;
    }
    return null;
  }
};

export const fetchInitialPrice = async (symbol) => {
  try {
    const url = `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`;
    const tickerData = await fetchWithRetry(url, 3, 1000);
    
    if (tickerData && tickerData.price) {
      return parseFloat(tickerData.price);
    }
    return null;
  } catch (err) {
    if (err.name !== 'AbortError') {
      void 0;
    }
    return null;
  }
};

