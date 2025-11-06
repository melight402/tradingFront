import { useState, useEffect } from "react";
import {
  loadSelectedSymbol,
  saveSelectedSymbol,
  loadRisk,
  saveRisk,
  loadOrderType,
  saveOrderType,
  loadTVXValue,
  saveTVXValue,
  loadRatio,
  saveRatio,
  loadATRValue,
  saveATRValue,
} from "../services/localStorageUtils";

export const useTradingState = () => {
  const [symbol, setSymbol] = useState(() => loadSelectedSymbol("BTCUSDT"));
  const [drawingTool, setDrawingTool] = useState(null);
  const [risk, setRisk] = useState(() => loadRisk(1));
  const [orderType, setOrderType] = useState(() => loadOrderType());
  const [tvxValue, setTVXValue] = useState(() => loadTVXValue());
  const [stopPrice, setStopPrice] = useState(null);
  const [atrValue, setAtrValue] = useState(() => loadATRValue(1));
  const [ratio, setRatio] = useState(() => loadRatio("2"));
  const [profitLoss, setProfitLoss] = useState("profit");

  useEffect(() => {
    saveSelectedSymbol(symbol);
  }, [symbol]);

  useEffect(() => {
    saveRisk(risk);
    if (typeof window !== 'undefined') {
      window.__CURRENT_RISK = risk;
    }
  }, [risk]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__CURRENT_SYMBOL = symbol;
    }
  }, [symbol]);

  useEffect(() => {
    saveOrderType(orderType);
  }, [orderType]);

  useEffect(() => {
    saveTVXValue(tvxValue);
  }, [tvxValue]);

  useEffect(() => {
    saveRatio(ratio);
  }, [ratio]);

  useEffect(() => {
    saveATRValue(atrValue);
  }, [atrValue]);

  return {
    symbol,
    setSymbol,
    drawingTool,
    setDrawingTool,
    risk,
    setRisk,
    orderType,
    setOrderType,
    tvxValue,
    setTVXValue,
    stopPrice,
    setStopPrice,
    atrValue,
    setAtrValue,
    ratio,
    setRatio,
    profitLoss,
    setProfitLoss,
  };
};

