import { addSubscriber, removeSubscriber, getSubscribers, hasAnySubscribers, getFirstSymbolWithSubscribers } from './priceSubscriberManager';
import { getCurrentPrice as getPriceFromStorage, setLastCandle, getCandlesMap, deleteCurrentPrice, deleteCandlesMap } from './priceDataStorage';
import { getCurrentActiveSymbol, setCurrentActiveSymbol } from './priceUpdateProcessor';
import { switchWebSocketToSymbol, isWebSocketOpen, closeWebSocket } from './priceWebSocketManager';
import { fetchLastCandleForInterval } from './candleDataService';

export const subscribeToPriceUpdates = (symbol, interval, callback) => {
  const subscriberId = addSubscriber(symbol, interval, callback);
  
  const needToSwitch = getCurrentActiveSymbol() !== symbol || !isWebSocketOpen();
  
  if (needToSwitch) {
    switchWebSocketToSymbol(symbol);
  } else {
    const candlesMap = getCandlesMap(symbol);
    if (!candlesMap || !candlesMap.has(interval)) {
      fetchLastCandleForInterval(symbol, interval).then((candle) => {
        if (candle) {
          setLastCandle(symbol, interval, candle);
          
          const currentPrice = getPriceFromStorage(symbol);
          if (currentPrice && callback && getCurrentActiveSymbol() === symbol) {
            const updatedCandle = {
              ...candle,
              close: currentPrice,
              high: Math.max(candle.high, currentPrice),
              low: Math.min(candle.low, currentPrice)
            };
            callback(updatedCandle);
          } else if (callback && getCurrentActiveSymbol() === symbol) {
            callback(candle);
          }
        }
      });
    } else {
      const baseCandle = candlesMap.get(interval);
      const currentPrice = getPriceFromStorage(symbol);
      
      if (currentPrice && callback && getCurrentActiveSymbol() === symbol) {
        const updatedCandle = {
          ...baseCandle,
          close: currentPrice,
          high: Math.max(baseCandle.high, currentPrice),
          low: Math.min(baseCandle.low, currentPrice)
        };
        callback(updatedCandle);
      } else if (callback && getCurrentActiveSymbol() === symbol) {
        callback(baseCandle);
      }
    }
  }
  
  return () => {
    const hasSubscribers = !removeSubscriber(symbol, subscriberId);
    
    if (hasSubscribers) {
      deleteCurrentPrice(symbol);
      deleteCandlesMap(symbol);
      
      const hasAnySubs = hasAnySubscribers();
      
      if (!hasAnySubs) {
        closeWebSocket();
        setCurrentActiveSymbol(null);
      } else if (getCurrentActiveSymbol() === symbol) {
        const firstSymbol = getFirstSymbolWithSubscribers();
        if (firstSymbol) {
          switchWebSocketToSymbol(firstSymbol);
        }
      }
    }
  };
};

export const getCurrentPrice = (symbol) => {
  return getPriceFromStorage(symbol);
};
