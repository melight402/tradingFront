import {useCallback, useEffect, useRef, useState} from "react";

export function useMarketData(symbol = "BTCUSDT", interval = "1h", limit = 500) {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const updateIntervalRef = useRef(null);
  const onLastCandleUpdateRef = useRef(null);
  const currentSymbolRef = useRef(symbol);
  const currentIntervalRef = useRef(interval);
  const instanceIdRef = useRef(Symbol());

  const fetchWithRetry = useCallback(async (url, maxRetries = 3, retryDelay = 1000) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (err) {
        if (err.name === 'AbortError' || attempt === maxRetries - 1) {
          throw err;
        }
        
        if (err instanceof TypeError && (
          err.message.includes('Failed to fetch') ||
          err.message.includes('network') ||
          err.message.includes('connection')
        )) {
          const delay = retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw err;
      }
    }
  }, []);

  const fetchLastCandle = useCallback(async () => {
    const currentSymbol = currentSymbolRef.current;
    const currentInterval = currentIntervalRef.current;
    try {
      const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${currentSymbol}&interval=${currentInterval}&limit=1`;
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
  }, [fetchWithRetry]);

  const updateLastCandle = useCallback(async () => {
    if (!onLastCandleUpdateRef.current) {
      return;
    }
    
    const expectedSymbol = currentSymbolRef.current;
    const expectedInterval = currentIntervalRef.current;
    const expectedInstanceId = instanceIdRef.current;
    
    const lastCandle = await fetchLastCandle();
    
    if (
      lastCandle && 
      onLastCandleUpdateRef.current &&
      currentSymbolRef.current === expectedSymbol &&
      currentIntervalRef.current === expectedInterval &&
      instanceIdRef.current === expectedInstanceId
    ) {
      onLastCandleUpdateRef.current(lastCandle);
    }
  }, [fetchLastCandle]);

  useEffect(() => {
    instanceIdRef.current = Symbol();
    
    setLoaded(false);
    setError(null);
    setData(null);

    currentSymbolRef.current = symbol;
    currentIntervalRef.current = interval;

    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
    onLastCandleUpdateRef.current = null;

    const actualLimit = Math.min(limit, 1500);
    const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${actualLimit}`;

    fetchWithRetry(url, 3, 1000)
      .then((klineData) => {
        const convertedData = klineData.map((kline) => ({
          date: new Date(kline[0]),
          open: parseFloat(kline[1]),
          high: parseFloat(kline[2]),
          low: parseFloat(kline[3]),
          close: parseFloat(kline[4]),
          volume: parseFloat(kline[5]),
        }));

        setData(convertedData);
        setLoaded(true);
        setError(null);

        let updateDelay = 5000;
        if (interval.includes('m')) {
          const minutes = parseInt(interval);
          if (minutes <= 3) {
            updateDelay = 1000;
          } else if (minutes <= 15) {
            updateDelay = 2000;
          }
        } else if (interval.includes('h')) {
          const hours = parseInt(interval);
          if (hours <= 1) {
            updateDelay = 2000;
          }
        }
        
        const checkAndStartInterval = () => {
          if (currentSymbolRef.current === symbol && currentIntervalRef.current === interval) {
            updateIntervalRef.current = setInterval(updateLastCandle, updateDelay);
          }
        };
        
        setTimeout(checkAndStartInterval, 100);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          void 0;
        }
        setError(err.message || 'Failed to load market data');
        setLoaded(true);
      });

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
      onLastCandleUpdateRef.current = null;
    };
  }, [symbol, interval, limit, updateLastCandle, fetchWithRetry]);

  return {
    data,
    loaded,
    error,
    setOnLastCandleUpdate: (callback) => {
      onLastCandleUpdateRef.current = callback;
    },
  };
}
