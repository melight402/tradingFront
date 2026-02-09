import { useState, useEffect } from "react";
import { storageManager } from "../services/storageManager";

export const useTradingState = () => {
  const [symbol, setSymbol] = useState(() => storageManager.loadSymbol("BTCUSDT"));
  const [drawingTool, setDrawingTool] = useState(null);
  const [risk, setRisk] = useState(() => storageManager.loadRisk(1));
  const [orderType, setOrderType] = useState(() => storageManager.loadOrderType());
  const [tvxValue, setTVXValue] = useState(() => storageManager.loadTVXValue());
  const [stopPrice, setStopPrice] = useState(null);
  const [atrValue, setAtrValue] = useState(() => storageManager.loadATRValue(1));
  const [ratio, setRatio] = useState(() => storageManager.loadRatio("2"));
  const [profitLoss, setProfitLoss] = useState("profit");
  const [tradeNote, setTradeNote] = useState("");

  useEffect(() => {
    storageManager.saveSymbol(symbol);
  }, [symbol]);

  useEffect(() => {
    storageManager.saveRisk(risk);
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
    storageManager.saveOrderType(orderType);
  }, [orderType]);

  useEffect(() => {
    storageManager.saveTVXValue(tvxValue);
  }, [tvxValue]);

  useEffect(() => {
    storageManager.saveRatio(ratio);
  }, [ratio]);

  useEffect(() => {
    storageManager.saveATRValue(atrValue);
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
    tradeNote,
    setTradeNote,
  };
};

