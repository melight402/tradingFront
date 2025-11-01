import { useState, useEffect, useRef } from 'react';
import { subscribeToTimeAndSales, updateLastCandleForInterval } from '../services/timeAndSalesService';

export const useTimeAndSales = (symbol, interval, lastCandle) => {
  const [buySum, setBuySum] = useState(0);
  const [sellSum, setSellSum] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);
  const lastCandleRef = useRef(lastCandle);

  useEffect(() => {
    lastCandleRef.current = lastCandle;
  }, [lastCandle]);

  useEffect(() => {
    setBuySum(0);
    setSellSum(0);
    setLoading(true);
    setError(null);

    if (!lastCandle || !lastCandle.date) {
      setLoading(false);
      return;
    }

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    unsubscribeRef.current = subscribeToTimeAndSales(
      symbol,
      interval,
      lastCandle,
      (sums) => {
        if (sums) {
          setBuySum(sums.buySum || 0);
          setSellSum(sums.sellSum || 0);
          setLoading(false);
          setError(null);
        }
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [symbol, interval, lastCandle]);

  useEffect(() => {
    if (lastCandle && lastCandle.date) {
      updateLastCandleForInterval(symbol, interval, lastCandle);
    }
  }, [symbol, interval, lastCandle]);

  return { buySum, sellSum, loading, error };
};
