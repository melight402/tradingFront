import { useState, useEffect } from "react";
import {
  loadSelectedSymbol,
  saveSelectedSymbol,
  loadRisk,
  saveRisk,
  loadOpenClose,
  saveOpenClose,
  loadOrderType,
  saveOrderType,
  loadTVXValue,
  saveTVXValue,
} from "../services/localStorageUtils";

export const useTradingState = () => {
  const [symbol, setSymbol] = useState(() => loadSelectedSymbol("BTCUSDT"));
  const [drawingTool, setDrawingTool] = useState(null);
  const [risk, setRisk] = useState(() => loadRisk(1));
  const [orderType, setOrderType] = useState(() => loadOrderType());
  const [tvxValue, setTVXValue] = useState(() => loadTVXValue());
  const [openClose, setOpenClose] = useState(() => loadOpenClose());
  const [stopPrice, setStopPrice] = useState(null);
  const [purchasePrice, setPurchasePrice] = useState(null);
  const [manualStopLoss, setManualStopLoss] = useState(null);
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
    saveOpenClose(openClose);
  }, [openClose]);

  useEffect(() => {
    saveOrderType(orderType);
  }, [orderType]);

  useEffect(() => {
    saveTVXValue(tvxValue);
  }, [tvxValue]);

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
    openClose,
    setOpenClose,
    stopPrice,
    setStopPrice,
    purchasePrice,
    setPurchasePrice,
    manualStopLoss,
    setManualStopLoss,
    profitLoss,
    setProfitLoss,
  };
};

