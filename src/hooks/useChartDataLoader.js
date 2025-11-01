import { useCallback, useRef } from "react";
import { fetchWithRetry } from "../utils/fetchWithRetry";
import { convertKlineData } from "../utils/klineDataConverter";
import { subscribeToPriceUpdates } from "../services/priceUpdateService";

export const useChartDataLoader = (
  chartData,
  setChartData,
  unsubscribeRefs,
  onLastCandleUpdateRefs,
  currentSymbolRefs,
  currentIntervalRefs,
  instanceIdRefs
) => {
  const loadChartData = useCallback((key, symbol, interval, limit) => {
    instanceIdRefs.current[key] = Symbol();
    
    const actualLimit = Math.min(limit, 1500);
    const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${actualLimit}`;

    setChartData(prev => ({
      ...prev,
      [key]: { data: null, loaded: false, error: null }
    }));

    currentSymbolRefs.current[key] = symbol;
    currentIntervalRefs.current[key] = interval;

    if (unsubscribeRefs.current[key]) {
      unsubscribeRefs.current[key]();
      unsubscribeRefs.current[key] = null;
    }
    onLastCandleUpdateRefs.current[key] = null;

    fetchWithRetry(url, 3, 1000)
      .then((klineData) => {
        const convertedData = convertKlineData(klineData);

        if (convertedData.length === 0) {
          throw new Error('No valid data points after filtering');
        }

        setChartData(prev => ({
          ...prev,
          [key]: { data: convertedData, loaded: true, error: null }
        }));

        const setupPriceSubscription = () => {
          if (currentSymbolRefs.current[key] === symbol && currentIntervalRefs.current[key] === interval) {
            const unsubscribe = subscribeToPriceUpdates(
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
        if (err.name !== 'AbortError') {
          void 0;
        }
        setChartData(prev => ({
          ...prev,
          [key]: { data: null, loaded: true, error: err.message || 'Failed to load market data' }
        }));
      });
  }, [setChartData, unsubscribeRefs, onLastCandleUpdateRefs, currentSymbolRefs, currentIntervalRefs, instanceIdRefs]);

  return { loadChartData };
};

