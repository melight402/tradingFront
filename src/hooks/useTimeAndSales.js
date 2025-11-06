import { useState, useEffect, useRef } from 'react';
import { subscribeToTimeAndSales, updateLastCandleForInterval } from '../services/timeAndSalesService';

export const useTimeAndSales = (symbol, interval, lastCandle) => {
  const [buySum, setBuySum] = useState(0);
  const [sellSum, setSellSum] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);
  const lastCandleRef = useRef(lastCandle);
  const symbolIntervalRef = useRef(`${symbol}-${interval}`);

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

    const currentKey = `${symbol}-${interval}`;
    const previousKey = symbolIntervalRef.current;

    if (unsubscribeRef.current && currentKey !== previousKey) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!unsubscribeRef.current) {
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
      symbolIntervalRef.current = currentKey;
    }

    return () => {
      if (unsubscribeRef.current && currentKey !== previousKey) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [symbol, interval]);

  useEffect(() => {
    if (lastCandle && lastCandle.date && unsubscribeRef.current) {
      updateLastCandleForInterval(symbol, interval, lastCandle);
    }
  }, [symbol, interval, lastCandle]);

  return { buySum, sellSum, loading, error };
};
