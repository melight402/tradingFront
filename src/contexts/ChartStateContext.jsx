import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { saveChartState } from "../services/chartStateStorage";
import { saveLineToolsToStorage } from "../services/lineToolsManager";

const ChartStateContext = createContext(null);

export const ChartStateProvider = ({ children }) => {
  const [chartStates, setChartStates] = useState({});
  const [lineToolsStates, setLineToolsStates] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;

    const loadedChartStates = {};
    const loadedLineToolsStates = {};

    try {
      const allKeys = Object.keys(localStorage);
      allKeys.forEach((key) => {
        if (key.startsWith("tradingFront_chartState_")) {
          try {
            const parts = key.replace("tradingFront_chartState_", "").split("_");
            if (parts.length >= 3) {
              const chartKey = parts[0];
              const interval = parts[parts.length - 1];
              const symbol = parts.slice(1, -1).join("_");
              const stateKey = `${chartKey}_${symbol}_${interval}`;
              if (!loadedChartStates[stateKey]) {
                const saved = localStorage.getItem(key);
                if (saved) {
                  loadedChartStates[stateKey] = JSON.parse(saved);
                }
              }
            }
          } catch {
            void 0;
          }
        } else if (key.startsWith("tradingFront_lineTools_")) {
          try {
            const parts = key.replace("tradingFront_lineTools_", "").split("_");
            if (parts.length >= 2) {
              const interval = parts[parts.length - 1];
              const symbol = parts.slice(0, -1).join("_");
              const toolsKey = `${symbol}_${interval}`;
              if (!loadedLineToolsStates[toolsKey]) {
                const saved = localStorage.getItem(key);
                if (saved && saved.trim() !== "" && saved !== "[]") {
                  loadedLineToolsStates[toolsKey] = saved;
                }
              }
            }
          } catch {
            void 0;
          }
        }
      });
    } catch {
      void 0;
    }

    setChartStates(loadedChartStates);
    setLineToolsStates(loadedLineToolsStates);
    isInitializedRef.current = true;
    setIsLoaded(true);
  }, []);

  const getChartState = (chartKey, symbol, interval) => {
    const key = `${chartKey}_${symbol}_${interval}`;
    return chartStates[key] || null;
  };

  const setChartState = (chartKey, symbol, interval, state) => {
    const key = `${chartKey}_${symbol}_${interval}`;
    setChartStates((prev) => {
      const updated = { ...prev };
      if (state && (state.logicalRange || state.timeRange || state.priceScale || state.priceRange)) {
        updated[key] = state;
        saveChartState(chartKey, symbol, interval, state);
      } else {
        delete updated[key];
      }
      return updated;
    });
  };

  const getLineTools = (symbol, interval) => {
    const key = `${symbol}_${interval}`;
    return lineToolsStates[key] || null;
  };

  const setLineTools = (symbol, interval, lineToolsJson) => {
    const key = `${symbol}_${interval}`;
    setLineToolsStates((prev) => {
      const updated = { ...prev };
      if (lineToolsJson && lineToolsJson.trim() !== "" && lineToolsJson !== "[]") {
        updated[key] = lineToolsJson;
        saveLineToolsToStorage(symbol, interval, lineToolsJson);
      } else {
        delete updated[key];
      }
      return updated;
    });
  };

  const value = {
    getChartState,
    setChartState,
    getLineTools,
    setLineTools,
    isLoaded,
  };

  return <ChartStateContext.Provider value={value}>{children}</ChartStateContext.Provider>;
};

export const useChartState = () => {
  const context = useContext(ChartStateContext);
  if (!context) {
    throw new Error("useChartState must be used within ChartStateProvider");
  }
  return context;
};

