import { 
  subscribers, 
  intervalSums, 
  switchWebSocketToSymbol,
  getCurrentActiveSymbol,
  setCurrentActiveSymbol,
  getGlobalWebSocket,
  closeGlobalWebSocket
} from './timeAndSalesWebSocket';

const fetchTimeAndSalesFromKline = async (symbol, interval) => {
  try {
    const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=1`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return { buySum: 0, sellSum: 0 };
    }

    const klineData = await response.json();

    if (!Array.isArray(klineData) || klineData.length === 0) {
      return { buySum: 0, sellSum: 0 };
    }

    const kline = klineData[0];
    
    if (!Array.isArray(kline) || kline.length < 11) {
      return { buySum: 0, sellSum: 0 };
    }

    const quoteVolume = parseFloat(kline[7]) || 0;
    const takerBuyQuoteVolume = parseFloat(kline[10]) || 0;
    
    const buySum = takerBuyQuoteVolume;
    const sellSum = quoteVolume - takerBuyQuoteVolume;

    return { buySum, sellSum };
  } catch {
      void 0;
    return { buySum: 0, sellSum: 0 };
  }
};


export const subscribeToTimeAndSales = (symbol, interval, lastCandle, callback) => {
  if (!subscribers.has(symbol)) {
    subscribers.set(symbol, new Set());
  }

  const symbolSubscribers = subscribers.get(symbol);
  const subscriberId = `${symbol}-${interval}`;
  
  let subscriber = null;
  for (const sub of symbolSubscribers) {
    if (sub.interval === interval) {
      subscriber = sub;
      subscriber.lastCandle = lastCandle;
      subscriber.callback = callback;
      break;
    }
  }

  if (!subscriber) {
    subscriber = { interval, lastCandle, callback, id: subscriberId };
    symbolSubscribers.add(subscriber);
  }

  const key = `${symbol}-${interval}`;

  const loadHistoricalData = async () => {
    const historical = await fetchTimeAndSalesFromKline(symbol, interval);
    
    if (historical) {
      intervalSums.set(key, historical);
      
      if (subscriber.callback && getCurrentActiveSymbol() === symbol) {
        subscriber.callback(historical);
      }
    }
  };

  const needToSwitch = getCurrentActiveSymbol() !== symbol || !getGlobalWebSocket() || getGlobalWebSocket().readyState !== WebSocket.OPEN;

  if (needToSwitch) {
    const previousSymbol = getCurrentActiveSymbol();
    if (previousSymbol && previousSymbol !== symbol) {
      const previousSymbolSubscribers = subscribers.get(previousSymbol);
      if (previousSymbolSubscribers) {
        previousSymbolSubscribers.forEach((prevSub) => {
          const prevKey = `${previousSymbol}-${prevSub.interval}`;
          intervalSums.delete(prevKey);
        });
      }
    }
    switchWebSocketToSymbol(symbol);
    loadHistoricalData();
  } else {
    const existingSums = intervalSums.get(key);
    if (!existingSums) {
      loadHistoricalData();
    } else if (subscriber.callback && getCurrentActiveSymbol() === symbol) {
      subscriber.callback(existingSums);
    }
  }

  return () => {
    const subs = subscribers.get(symbol);
    if (subs) {
      for (const sub of subs) {
        if (sub.id === subscriberId) {
          subs.delete(sub);
          break;
        }
      }

      intervalSums.delete(key);

      if (subs.size === 0) {
        subscribers.delete(symbol);

        const hasAnySubscribers = Array.from(subscribers.values()).some(set => set.size > 0);

        if (!hasAnySubscribers) {
          closeGlobalWebSocket();
          setCurrentActiveSymbol(null);
        } else if (getCurrentActiveSymbol() === symbol) {
          const firstSymbolWithSubscribers = Array.from(subscribers.entries()).find(([, set]) => set.size > 0);
          if (firstSymbolWithSubscribers) {
            switchWebSocketToSymbol(firstSymbolWithSubscribers[0]);
          }
        }
      }
    }
  };
};

export const updateLastCandleForInterval = (symbol, interval, lastCandle) => {
  const symbolSubscribers = subscribers.get(symbol);
  if (!symbolSubscribers) {
    return;
  }

  symbolSubscribers.forEach((subscriber) => {
    if (subscriber.interval === interval) {
      const oldCandle = subscriber.lastCandle;
      const key = `${symbol}-${interval}`;
      
      const oldCandleTime = oldCandle?.date?.getTime();
      const newCandleTime = lastCandle?.date?.getTime();
      
      const isNewCandle = oldCandleTime && newCandleTime && newCandleTime !== oldCandleTime;
      
      subscriber.lastCandle = lastCandle;
      
      if (isNewCandle) {
        intervalSums.set(key, { buySum: 0, sellSum: 0 });
        
        if (subscriber.callback) {
          subscriber.callback({ buySum: 0, sellSum: 0 });
        }
        
        closeGlobalWebSocket();
        setCurrentActiveSymbol(null);
        
        setTimeout(() => {
          switchWebSocketToSymbol(symbol);
        }, 100);
      }
      
      fetchTimeAndSalesFromKline(symbol, interval).then((sums) => {
        const currentSums = intervalSums.get(key);
        
        if (isNewCandle) {
          intervalSums.set(key, sums);
          
          if (subscriber.callback) {
            subscriber.callback(sums);
          }
        } else if (!currentSums || (currentSums.buySum === 0 && currentSums.sellSum === 0)) {
          intervalSums.set(key, sums);
          
          if (subscriber.callback) {
            subscriber.callback(sums);
          }
        } else {
          const mergedSums = {
            buySum: Math.max(currentSums.buySum, sums.buySum),
            sellSum: Math.max(currentSums.sellSum, sums.sellSum)
          };
          
          intervalSums.set(key, mergedSums);
          
          if (subscriber.callback) {
            subscriber.callback(mergedSums);
          }
        }
      });
    }
  });
};

