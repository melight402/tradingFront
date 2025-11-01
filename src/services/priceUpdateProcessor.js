import { getIntervalMs, calculateCandleStartTime } from '../utils/intervalHelpers';
import { fetchLastCandleForInterval } from './candleDataService';
import { getSubscribers } from './priceSubscriberManager';
import { getCandlesMap, setLastCandle, setCurrentPrice } from './priceDataStorage';

let currentActiveSymbol = null;

export const setCurrentActiveSymbol = (symbol) => {
  currentActiveSymbol = symbol;
};

export const getCurrentActiveSymbol = () => {
  return currentActiveSymbol;
};

export const updatePriceFromWebSocket = (symbol, price) => {
  setCurrentPrice(symbol, price);
  
  const symbolSubscribers = getSubscribers(symbol);
  if (!symbolSubscribers || symbolSubscribers.size === 0) {
    return;
  }

  const candlesMap = getCandlesMap(symbol);
  if (!candlesMap) {
    return;
  }

  const currentTime = Date.now();
  
  for (const subscriber of symbolSubscribers) {
    if (subscriber.interval && subscriber.callback) {
      const baseCandle = candlesMap.get(subscriber.interval);
      
      if (baseCandle) {
        const intervalMs = getIntervalMs(subscriber.interval);
        const candleStartTime = baseCandle.date.getTime();
        const candleEndTime = candleStartTime + intervalMs;
        
        if (currentTime >= candleEndTime) {
          handleNewCandle(symbol, subscriber, price, intervalMs, candleStartTime);
        } else {
          handleCandleUpdate(symbol, subscriber, baseCandle, price, candlesMap);
        }
      }
    }
  }
};

const handleNewCandle = (symbol, subscriber, price, intervalMs, candleStartTime) => {
  const newCandleStartTime = calculateCandleStartTime(Date.now(), subscriber.interval);
  
  if (newCandleStartTime > candleStartTime) {
    const newCandle = {
      date: new Date(newCandleStartTime),
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 0
    };
    
    setLastCandle(symbol, subscriber.interval, newCandle);
    subscriber.callback(newCandle);
    
    fetchLastCandleForInterval(symbol, subscriber.interval).then((apiCandle) => {
      if (apiCandle && getCurrentActiveSymbol() === symbol) {
        const apiCandleTime = apiCandle.date.getTime();
        
        if (apiCandleTime === newCandleStartTime || (apiCandleTime >= newCandleStartTime && apiCandleTime < newCandleStartTime + intervalMs)) {
          const finalCandle = {
            date: apiCandle.date,
            open: apiCandle.open,
            high: Math.max(apiCandle.high, price),
            low: Math.min(apiCandle.low, price),
            close: price,
            volume: apiCandle.volume
          };
          
          setLastCandle(symbol, subscriber.interval, finalCandle);
          subscriber.callback(finalCandle);
        }
      }
    }).catch(() => {
      void 0;
    });
  }
};

const handleCandleUpdate = (symbol, subscriber, baseCandle, price, candlesMap) => {
  const updatedCandle = {
    ...baseCandle,
    close: price,
    high: Math.max(baseCandle.high, price),
    low: Math.min(baseCandle.low, price)
  };
  
  subscriber.callback(updatedCandle);
  candlesMap.set(subscriber.interval, updatedCandle);
};

