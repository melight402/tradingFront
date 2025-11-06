import { useCallback } from "react";
import { fetchWithRetry } from "../utils/fetchWithRetry";
import { convertKlineData } from "../utils/klineDataConverter";

export const useChartDataLoader = (
  setChartData,
  unsubscribeRefs,
  onLastCandleUpdateRefs,
  currentSymbolRefs,
  currentIntervalRefs,
  instanceIdRefs,
  subscribeToCandles
) => {
  const loadChartData = useCallback((key, symbol, interval, limit) => {
    const instanceId = Symbol();
    instanceIdRefs.current[key] = instanceId;
    
    const actualLimit = Math.min(limit, 1500);
    const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${actualLimit}`;

    currentSymbolRefs.current[key] = symbol;
    currentIntervalRefs.current[key] = interval;

    if (unsubscribeRefs.current[key]) {
      unsubscribeRefs.current[key]();
      unsubscribeRefs.current[key] = null;
    }
    onLastCandleUpdateRefs.current[key] = null;

    setChartData(prev => {
      const currentData = prev[key];
      if (currentData && currentData.data && currentData.loaded) {
        return {
          ...prev,
          [key]: { ...currentData, loaded: false, error: null }
        };
      }
      return {
        ...prev,
        [key]: { data: null, loaded: false, error: null }
      };
    });

    fetchWithRetry(url, 3, 1000)
      .then((klineData) => {
        if (instanceIdRefs.current[key] !== instanceId) {
          return;
        }

        if (currentSymbolRefs.current[key] !== symbol || currentIntervalRefs.current[key] !== interval) {
          return;
        }

        const convertedData = convertKlineData(klineData);

        if (convertedData.length === 0) {
          throw new Error('No valid data points after filtering');
        }

        if (instanceIdRefs.current[key] !== instanceId) {
          return;
        }

        if (currentSymbolRefs.current[key] !== symbol || currentIntervalRefs.current[key] !== interval) {
          return;
        }

        setChartData(prev => ({
          ...prev,
          [key]: { data: convertedData, loaded: true, error: null }
        }));

        const setupPriceSubscription = () => {
          if (instanceIdRefs.current[key] !== instanceId) {
            return;
          }

          if (currentSymbolRefs.current[key] === symbol && currentIntervalRefs.current[key] === interval && subscribeToCandles) {
            const unsubscribe = subscribeToCandles(
              key,
              symbol,
              interval,
              (lastCandle) => {
                const expectedSymbol = currentSymbolRefs.current[key];
                const expectedInterval = currentIntervalRefs.current[key];
                const expectedInstanceId = instanceIdRefs.current[key];
                
                if (
                  lastCandle &&
                  onLastCandleUpdateRefs.current[key] &&
                  currentSymbolRefs.current[key] === expectedSymbol &&
                  currentIntervalRefs.current[key] === expectedInterval &&
                  instanceIdRefs.current[key] === expectedInstanceId
                ) {
                  onLastCandleUpdateRefs.current[key](lastCandle);
                }
              }
            );
            
            unsubscribeRefs.current[key] = unsubscribe;
          }
        };
        
        setTimeout(setupPriceSubscription, 100);
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          return;
        }

        if (instanceIdRefs.current[key] !== instanceId) {
          return;
        }

        if (currentSymbolRefs.current[key] !== symbol || currentIntervalRefs.current[key] !== interval) {
          return;
        }

        setChartData(prev => {
          const currentData = prev[key];
          return {
            ...prev,
            [key]: { 
              data: currentData?.data || null, 
              loaded: true, 
              error: err.message || 'Failed to load market data' 
            }
          };
        });
      });
  }, [setChartData, unsubscribeRefs, onLastCandleUpdateRefs, currentSymbolRefs, currentIntervalRefs, instanceIdRefs, subscribeToCandles]);

  return { loadChartData };
};

