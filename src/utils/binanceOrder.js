import { positionQty } from "./risk";

// Соответствие нашего "Типа ордера" реальным типам ордеров Binance Futures
// (POST /fapi/v1/order). LIMIT и MARKET — стандартные; наш "стоп ордер"
// реализован как STOP_MARKET: у него нет цены исполнения, только stopPrice —
// уровень, при достижении которого биржа выставляет рыночный ордер.
const BINANCE_ORDER_TYPE = {
  limit: "LIMIT",
  market: "MARKET",
  stop: "STOP_MARKET",
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export async function openLivePosition({ symbol, side, orderType, entry, stop, riskUsdt, quantityStep }) {
  if (!Number.isFinite(Number(quantityStep)) || Number(quantityStep) <= 0) {
    throw new Error("Не удалось получить шаг количества инструмента; повторите попытку позже");
  }
  const isLong = side === "long";
  const quantity = positionQty(riskUsdt, entry, stop, quantityStep);
  const response = await fetch(`${API_BASE_URL}/binance/trading/open`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      symbol,
      side: isLong ? "BUY" : "SELL",
      positionSide: isLong ? "LONG" : "SHORT",
      orderType: BINANCE_ORDER_TYPE[orderType] || "LIMIT",
      quantity,
      entryPrice: entry,
      stopPrice: stop,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.details || data.error || "Не удалось открыть реальную позицию");
  return { ...data, quantity };
}

export async function closeLivePosition({ symbol, side, quantity, stopOrderId }) {
  const response = await fetch(`${API_BASE_URL}/binance/trading/close`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      symbol,
      side: side === "long" ? "SELL" : "BUY",
      positionSide: side === "long" ? "LONG" : "SHORT",
      quantity,
      stopOrderId,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.details || data.error || "Не удалось закрыть реальную позицию");
  return data;
}
