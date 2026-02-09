import React from "react";
import { useTradingState } from "../hooks/useTradingState";
import { TradingStateContext } from "./TradingStateContext";

export const TradingStateProvider = ({ children }) => {
  const tradingState = useTradingState();

  return (
    <TradingStateContext.Provider value={tradingState}>
      {children}
    </TradingStateContext.Provider>
  );
};
