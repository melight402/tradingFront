let symbolsWebSocket = null;
const subscribers = new Set();
let symbolsData = new Map();
let reconnectTimeout = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

const handleMessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    
    if (!Array.isArray(data)) {
      return;
    }

    data.forEach((ticker) => {
      if (!ticker.s || !ticker.c) {
        return;
      }

      const symbol = ticker.s;
      const lastPrice = parseFloat(ticker.c) || 0;
      const openPrice = parseFloat(ticker.o) || 0;
      const quoteVolume = parseFloat(ticker.q) || 0;
      
      let priceChangePercent = 0;
      if (ticker.P !== undefined) {
        priceChangePercent = parseFloat(ticker.P) || 0;
      } else if (openPrice > 0) {
        priceChangePercent = ((lastPrice - openPrice) / openPrice) * 100;
      }

      symbolsData.set(symbol, {
        symbol,
        lastPrice,
        openPrice,
        quoteVolume,
        priceChangePercent,
      });

      subscribers.forEach((callback) => {
        callback(Array.from(symbolsData.values()));
      });
    });
  } catch (err) {
    void 0;
  }
};

const handleError = () => {
  void 0;
};

const handleClose = () => {
  symbolsWebSocket = null;
  
  if (subscribers.size > 0 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectTimeout = setTimeout(() => {
      reconnectAttempts++;
      connect();
    }, RECONNECT_DELAY);
  } else {
    reconnectAttempts = 0;
  }
};

const connect = () => {
  if (symbolsWebSocket && symbolsWebSocket.readyState === WebSocket.OPEN) {
    return;
  }

  if (symbolsWebSocket) {
    if (symbolsWebSocket.readyState === WebSocket.OPEN || symbolsWebSocket.readyState === WebSocket.CONNECTING) {
      symbolsWebSocket.close();
    }
    symbolsWebSocket = null;
  }

  const wsUrl = "wss://fstream.binance.com/ws/!ticker@arr";
  
  symbolsWebSocket = new WebSocket(wsUrl);
  
  symbolsWebSocket.onopen = () => {
    reconnectAttempts = 0;
    void 0;
  };
  
  symbolsWebSocket.onmessage = handleMessage;
  
  symbolsWebSocket.onerror = handleError;
  
  symbolsWebSocket.onclose = handleClose;
};

export const subscribeToSymbolsUpdates = (callback) => {
  if (subscribers.size === 0) {
    connect();
  }

  subscribers.add(callback);

  if (symbolsData.size > 0) {
    callback(Array.from(symbolsData.values()));
  }

  return () => {
    subscribers.delete(callback);
    
    if (subscribers.size === 0) {
      if (symbolsWebSocket) {
        symbolsWebSocket.close();
        symbolsWebSocket = null;
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      reconnectAttempts = 0;
      symbolsData.clear();
    }
  };
};

export const getSymbolsData = () => {
  return Array.from(symbolsData.values());
};

