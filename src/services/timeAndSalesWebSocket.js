import { getIntervalMs } from './timeAndSalesHelpers';

const subscribers = new Map();
let globalWebSocket = null;
let currentActiveSymbol = null;
const intervalSums = new Map();

const updateSumsForAllIntervals = (symbol, trade) => {
  const tradePrice = parseFloat(trade.p);
  const tradeQuantity = parseFloat(trade.q);
  const tradeTime = trade.T;
  const isBuyerMaker = trade.m === true;

  if (!isFinite(tradePrice) || !isFinite(tradeQuantity) || tradePrice <= 0 || tradeQuantity <= 0 || !tradeTime) {
    return;
  }

  const tradeValue = tradePrice * tradeQuantity;
  const symbolSubscribers = subscribers.get(symbol);

  if (!symbolSubscribers) {
    return;
  }

  symbolSubscribers.forEach((subscriber) => {
    if (!subscriber.interval || !subscriber.lastCandle) {
      return;
    }

    const interval = subscriber.interval;
    const lastCandle = subscriber.lastCandle;
    const intervalMs = getIntervalMs(interval);
    const candleStartTime = lastCandle.date.getTime();
    const candleEndTime = candleStartTime + intervalMs;

    if (tradeTime >= candleStartTime && tradeTime < candleEndTime) {
      const key = `${symbol}-${interval}`;
      let sums = intervalSums.get(key);
      
      if (!sums) {
        return;
      }

      sums = { ...sums };

      if (isBuyerMaker) {
        sums.sellSum += tradeValue;
      } else {
        sums.buySum += tradeValue;
      }

      intervalSums.set(key, sums);

      if (subscriber.callback) {
        subscriber.callback({ ...sums });
      }
    } else if (interval === "1m" || interval === "5m") {
      console.log(`[Tape WebSocket] Trade outside candle: interval=${interval}, tradeTime=${tradeTime}, candleStart=${candleStartTime}, candleEnd=${candleEndTime}`);
    }
  });
};

const switchWebSocketToSymbol = (symbol) => {
  if (currentActiveSymbol === symbol && globalWebSocket && globalWebSocket.readyState === WebSocket.OPEN) {
    return;
  }

  if (globalWebSocket) {
    if (globalWebSocket.readyState === WebSocket.OPEN || globalWebSocket.readyState === WebSocket.CONNECTING) {
      globalWebSocket.close();
    }
    globalWebSocket = null;
  }

  currentActiveSymbol = symbol;

  const symbolLower = symbol.toLowerCase();
  const wsUrl = `wss://fstream.binance.com/ws/${symbolLower}@aggTrade`;

  globalWebSocket = new WebSocket(wsUrl);

  globalWebSocket.onopen = () => {
    void 0;
  };

  globalWebSocket.onmessage = (event) => {
    if (currentActiveSymbol !== symbol) {
      return;
    }

    try {
      const data = JSON.parse(event.data);

      if (data && data.p && data.q && data.T) {
        updateSumsForAllIntervals(symbol, data);
      }
    } catch (err) {
      void 0;
    }
  };

  globalWebSocket.onerror = () => {
    void 0;
  };

  globalWebSocket.onclose = () => {
    if (currentActiveSymbol === symbol) {
      globalWebSocket = null;

      if (subscribers.has(symbol) && subscribers.get(symbol).size > 0) {
        setTimeout(() => {
          if (subscribers.has(symbol) && subscribers.get(symbol).size > 0 && currentActiveSymbol === symbol) {
            switchWebSocketToSymbol(symbol);
          }
        }, 3000);
      } else {
        currentActiveSymbol = null;
      }
    }
  };
};

export const getCurrentActiveSymbol = () => currentActiveSymbol;
export const setCurrentActiveSymbol = (symbol) => { currentActiveSymbol = symbol; };
export const getGlobalWebSocket = () => globalWebSocket;
export const setGlobalWebSocket = (ws) => { globalWebSocket = ws; };
export const closeGlobalWebSocket = () => {
  if (globalWebSocket) {
    globalWebSocket.close();
    globalWebSocket = null;
  }
};

export { subscribers, intervalSums, switchWebSocketToSymbol };

