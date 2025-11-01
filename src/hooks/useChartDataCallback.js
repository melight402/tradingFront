import { useCallback } from "react";

export const useChartDataCallback = (onLastCandleUpdateRefs) => {
  const setOnLastCandleUpdate = useCallback((key, callback) => {
    onLastCandleUpdateRefs.current[key] = callback;
  }, [onLastCandleUpdateRefs]);

  return { setOnLastCandleUpdate };
};

