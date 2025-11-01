import { setCurrentActiveSymbol, getCurrentActiveSymbol, updatePriceFromWebSocket } from './priceUpdateProcessor';
import { getSubscribers, hasAnySubscribers, getFirstSymbolWithSubscribers } from './priceSubscriberManager';
import { initializeCandlesMap, setCurrentPrice } from './priceDataStorage';
import { fetchInitialPrice } from './candleDataService';
import { fetchLastCandleForInterval } from './candleDataService';

let globalWebSocket = null;

export const switchWebSocketToSymbol = (symbol) => {
  if (getCurrentActiveSymbol() === symbol && globalWebSocket && globalWebSocket.readyState === WebSocket.OPEN) {
    return;
  }
  
  if (globalWebSocket) {
    if (globalWebSocket.readyState === WebSocket.OPEN || globalWebSocket.readyState === WebSocket.CONNECTING) {
      globalWebSocket.close();
    }
    globalWebSocket = null;
  }
  
  setCurrentActiveSymbol(symbol);
  
  const symbolLower = symbol.toLowerCase();
  const wsUrl = `wss://fstream.binance.com/ws/${symbolLower}@ticker`;
  
  globalWebSocket = new WebSocket(wsUrl);
  
  globalWebSocket.onopen = () => {
    void 0;
    
    const intervalsSet = new Set();
    const symbolSubscribers = getSubscribers(symbol);
    if (symbolSubscribers) {
      for (const sub of symbolSubscribers) {
        if (sub.interval) {
          intervalsSet.add(sub.interval);
        }
      }
    }
    
    initializeLastCandles(symbol, intervalsSet).then(() => {
      fetchInitialPrice(symbol).then((initialPrice) => {
        if (initialPrice !== null && getCurrentActiveSymbol() === symbol) {
          setCurrentPrice(symbol, initialPrice);
          updatePriceFromWebSocket(symbol, initialPrice);
        }
      });
    });
  };
  
  globalWebSocket.onmessage = (event) => {
    if (getCurrentActiveSymbol() !== symbol) {
      return;
    }
    
    try {
      const data = JSON.parse(event.data);
      
      if (data.c && typeof data.c === 'string') {
        const price = parseFloat(data.c);
        if (!isNaN(price)) {
          updatePriceFromWebSocket(symbol, price);
        }
      }
    } catch (err) {
      void 0;
    }
  };
  
  globalWebSocket.onerror = () => {
    void 0;
  };
  
  globalWebSocket.onclose = () => {
    if (getCurrentActiveSymbol() === symbol) {
      globalWebSocket = null;
      
      if (getSubscribers(symbol) && getSubscribers(symbol).size > 0) {
        setTimeout(() => {
          if (getSubscribers(symbol) && getSubscribers(symbol).size > 0 && getCurrentActiveSymbol() === symbol) {
            switchWebSocketToSymbol(symbol);
          }
        }, 3000);
      } else {
        setCurrentActiveSymbol(null);
      }
    }
  };
};

const initializeLastCandles = async (symbol, intervals) => {
  const candlePromises = Array.from(intervals).map(async (interval) => {
    const candle = await fetchLastCandleForInterval(symbol, interval);
    return { interval, candle };
  });
  
  const results = await Promise.all(candlePromises);
  const candlesData = results.map(({ candle }) => candle);
  const intervalsArray = Array.from(intervals);
  
  initializeCandlesMap(symbol, intervalsArray, candlesData);
};

export const closeWebSocket = () => {
  if (globalWebSocket) {
    globalWebSocket.close();
    globalWebSocket = null;
  }
};

export const isWebSocketOpen = () => {
  return globalWebSocket && globalWebSocket.readyState === WebSocket.OPEN;
};

export const getWebSocket = () => {
  return globalWebSocket;
};

