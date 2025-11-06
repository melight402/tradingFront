import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { subscribeToPriceUpdates } from "../services/priceUpdateService";
import { subscribeToTimeAndSales, updateLastCandleForInterval } from "../services/timeAndSalesService";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [candleData, setCandleData] = useState({});
  const [timeAndSalesData, setTimeAndSalesData] = useState({});
  const unsubscribeCandlesRef = useRef({});
  const unsubscribeTapeRef = useRef({});
  const lastCandleRefs = useRef({});

  const subscribeToCandles = useCallback((key, symbol, interval, callback) => {
    if (unsubscribeCandlesRef.current[key]) {
      unsubscribeCandlesRef.current[key]();
    }

    const unsubscribe = subscribeToPriceUpdates(symbol, interval, (lastCandle) => {
      if (lastCandle) {
        setCandleData(prev => ({
          ...prev,
          [key]: { symbol, interval, lastCandle }
        }));
        if (callback) {
          callback(lastCandle);
        }
      }
    });

    unsubscribeCandlesRef.current[key] = unsubscribe;

    return unsubscribe;
  }, []);

  const subscribeToTape = useCallback((key, symbol, interval, lastCandle, callback) => {
    if (unsubscribeTapeRef.current[key]) {
      unsubscribeTapeRef.current[key]();
    }

    if (!lastCandle || !lastCandle.date) {
      setTimeAndSalesData(prev => ({
        ...prev,
        [key]: { symbol, interval, buySum: 0, sellSum: 0, loading: false }
      }));
      return () => {};
    }

    lastCandleRefs.current[key] = lastCandle;

    const unsubscribe = subscribeToTimeAndSales(
      symbol,
      interval,
      lastCandle,
      (sums) => {
        if (sums) {
          setTimeAndSalesData(prev => ({
            ...prev,
            [key]: { 
              symbol, 
              interval, 
              buySum: sums.buySum || 0, 
              sellSum: sums.sellSum || 0, 
              loading: false 
            }
          }));
          if (callback) {
            callback(sums);
          }
        }
      }
    );

    unsubscribeTapeRef.current[key] = unsubscribe;

    return unsubscribe;
  }, []);

  const updateLastCandleForTape = useCallback((key, symbol, interval, lastCandle) => {
    if (lastCandle && lastCandle.date) {
      lastCandleRefs.current[key] = lastCandle;
      updateLastCandleForInterval(symbol, interval, lastCandle);
    }
  }, []);

  const cleanup = useCallback((key) => {
    if (unsubscribeCandlesRef.current[key]) {
      unsubscribeCandlesRef.current[key]();
      delete unsubscribeCandlesRef.current[key];
    }
    if (unsubscribeTapeRef.current[key]) {
      unsubscribeTapeRef.current[key]();
      delete unsubscribeTapeRef.current[key];
    }
    delete lastCandleRefs.current[key];
    setCandleData(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    setTimeAndSalesData(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  }, []);

  const value = useMemo(() => ({
    subscribeToCandles,
    subscribeToTape,
    updateLastCandleForTape,
    cleanup,
    candleData,
    timeAndSalesData
  }), [subscribeToCandles, subscribeToTape, updateLastCandleForTape, cleanup, candleData, timeAndSalesData]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within SocketProvider");
  }
  return context;
};

export const useCandleData = (key, symbol, interval) => {
  const { candleData } = useSocketContext();
  
  return useMemo(() => {
    const data = candleData[key];
    
    if (!data || data.symbol !== symbol || data.interval !== interval) {
      return { lastCandle: null };
    }
    
    return { lastCandle: data.lastCandle };
  }, [candleData, key, symbol, interval]);
};

export const useTimeAndSalesData = (key, symbol, interval) => {
  const { timeAndSalesData } = useSocketContext();
  
  return useMemo(() => {
    const data = timeAndSalesData[key];
    
    if (!data || data.symbol !== symbol || data.interval !== interval) {
      return { buySum: 0, sellSum: 0, loading: true };
    }
    
    return { 
      buySum: data.buySum || 0, 
      sellSum: data.sellSum || 0, 
      loading: data.loading !== false 
    };
  }, [timeAndSalesData, key, symbol, interval]);
};

