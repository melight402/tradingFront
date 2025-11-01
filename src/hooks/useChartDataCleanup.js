import { useCallback } from "react";

export const useChartDataCleanup = (
  unsubscribeRefs,
  onLastCandleUpdateRefs,
  currentSymbolRefs,
  currentIntervalRefs,
  instanceIdRefs
) => {
  const cleanup = useCallback((key) => {
    if (unsubscribeRefs.current[key]) {
      unsubscribeRefs.current[key]();
      unsubscribeRefs.current[key] = null;
    }
    onLastCandleUpdateRefs.current[key] = null;
    delete currentSymbolRefs.current[key];
    delete currentIntervalRefs.current[key];
    delete instanceIdRefs.current[key];
  }, [unsubscribeRefs, onLastCandleUpdateRefs, currentSymbolRefs, currentIntervalRefs, instanceIdRefs]);

  return { cleanup };
};

