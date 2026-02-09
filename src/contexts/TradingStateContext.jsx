import { createContext, useContext } from "react";

export const TradingStateContext = createContext();

export const useTradingStateContext = () => {
  const context = useContext(TradingStateContext);
  if (!context) {
    throw new Error("useTradingStateContext must be used within TradingStateProvider");
  }
  return context;
};
