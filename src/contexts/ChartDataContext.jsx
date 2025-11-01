import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useChartDataLoader } from "../hooks/useChartDataLoader";
import { useChartDataCleanup } from "../hooks/useChartDataCleanup";
import { useChartDataCallback } from "../hooks/useChartDataCallback";

const ChartDataContext = createContext(null);

export const ChartDataProvider = ({ children }) => {
  const [chartData, setChartData] = useState({});
  const unsubscribeRefs = useRef({});
  const onLastCandleUpdateRefs = useRef({});
  const currentSymbolRefs = useRef({});
  const currentIntervalRefs = useRef({});
  const instanceIdRefs = useRef({});

  const { loadChartData } = useChartDataLoader(
    chartData,
    setChartData,
    unsubscribeRefs,
    onLastCandleUpdateRefs,
    currentSymbolRefs,
    currentIntervalRefs,
    instanceIdRefs
  );

  const { cleanup } = useChartDataCleanup(
    unsubscribeRefs,
    onLastCandleUpdateRefs,
    currentSymbolRefs,
    currentIntervalRefs,
    instanceIdRefs
  );

  const { setOnLastCandleUpdate } = useChartDataCallback(onLastCandleUpdateRefs);

  const getChartData = (key) => {
    return chartData[key] || { data: null, loaded: false, error: null };
  };

  return (
    <ChartDataContext.Provider value={{
      loadChartData,
      getChartData,
      setOnLastCandleUpdate,
      cleanup
    }}>
      {children}
    </ChartDataContext.Provider>
  );
};

export const useChartData = (key, symbol, interval, limit = 500) => {
  const context = useContext(ChartDataContext);
  
  if (!context) {
    throw new Error('useChartData must be used within ChartDataProvider');
  }

  const { loadChartData, getChartData, setOnLastCandleUpdate, cleanup } = context;

  useEffect(() => {
    const dataKey = `${key}-${symbol}-${interval}`;
    loadChartData(dataKey, symbol, interval, limit);

    return () => {
      cleanup(dataKey);
    };
  }, [key, symbol, interval, limit, loadChartData, cleanup]);

  const dataKey = `${key}-${symbol}-${interval}`;
  const currentChartData = getChartData(dataKey);

  return {
    data: currentChartData.data,
    loaded: currentChartData.loaded,
    error: currentChartData.error,
    setOnLastCandleUpdate: (callback) => setOnLastCandleUpdate(dataKey, callback),
  };
};
