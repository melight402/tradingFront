// Тонкая обёртка над публичным REST/WS API Binance Futures (USDT-M).
// Ключи API не нужны — используются только публичные, не требующие авторизации
// эндпоинты рыночных данных (свечи, тикеры). Реальные торговые запросы
// выполняются через подписанный backend API.

const FAPI = "https://fapi.binance.com";
const WS_BASE = "wss://fstream.binance.com";

/**
 * Загрузить исторические свечи.
 * Возвращает массив в формате, понятном lightweight-charts:
 * { time (сек), open, high, low, close, volume, takerBuyBaseVolume }
 */
export async function fetchKlines(symbol, interval, limit = 500) {
  const url = `${FAPI}/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance klines ${res.status}`);
  const raw = await res.json();
  return raw.map((k) => ({
    time: Math.floor(k[0] / 1000),
    open: +k[1],
    high: +k[2],
    low: +k[3],
    close: +k[4],
    volume: +k[5],
    takerBuyBaseVolume: +k[9],
  }));
}

/** 24-часовая статистика по всем бессрочным USDT-парам. */
export async function fetchTicker24hr() {
  const res = await fetch(`${FAPI}/fapi/v1/ticker/24hr`);
  if (!res.ok) throw new Error(`Binance ticker24hr ${res.status}`);
  const raw = await res.json();
  return raw
    .filter((t) => t.symbol.endsWith("USDT"))
    .map((t) => ({
      symbol: t.symbol,
      lastPrice: +t.lastPrice,
      priceChangePercent: +t.priceChangePercent,
      quoteVolume: +t.quoteVolume,
    }));
}

export async function fetchTickerPrice(symbol) {
  const res = await fetch(`${FAPI}/fapi/v1/ticker/price?symbol=${encodeURIComponent(symbol)}`);
  if (!res.ok) throw new Error(`Binance ticker price ${res.status}`);
  const ticker = await res.json();
  return Number(ticker.price);
}

/** Список доступных бессрочных USDT-инструментов (для валидации/автокомплита). */
export async function fetchExchangeInfo() {
  const res = await fetch(`${FAPI}/fapi/v1/exchangeInfo`);
  if (!res.ok) throw new Error(`Binance exchangeInfo ${res.status}`);
  const raw = await res.json();
  return raw.symbols
    .filter((s) => s.contractType === "PERPETUAL" && s.quoteAsset === "USDT" && s.status === "TRADING")
    .map((s) => s.symbol);
}

/** Price and quantity increments for USDT-M perpetual contracts. */
export async function fetchFuturesInstrumentInfo() {
  const res = await fetch(`${FAPI}/fapi/v1/exchangeInfo`);
  if (!res.ok) throw new Error(`Binance futures exchangeInfo ${res.status}`);
  const raw = await res.json();
  return Object.fromEntries(
    raw.symbols
      .filter((s) => s.contractType === "PERPETUAL" && s.quoteAsset === "USDT" && s.status === "TRADING")
      .map((s) => {
        const priceFilter = s.filters.find((filter) => filter.filterType === "PRICE_FILTER");
        const lotFilter = s.filters.find((filter) => filter.filterType === "LOT_SIZE");
        const marketLotFilter = s.filters.find((filter) => filter.filterType === "MARKET_LOT_SIZE");
        return [s.symbol, {
          tickSize: Number(priceFilter?.tickSize),
          quantityStep: Number(lotFilter?.stepSize),
          marketQuantityStep: Number(marketLotFilter?.stepSize),
        }];
      })
  );
}

/**
 * Подписка на живые обновления свечи через WebSocket.
 * onUpdate получает объект свечи в том же формате, что и fetchKlines.
 * Возвращает функцию отписки.
 */
export function subscribeKline(symbol, interval, onUpdate) {
  const stream = `${symbol.toLowerCase()}@kline_${interval}`;
  let ws;
  let closedByUser = false;
  let retryTimer = null;

  const connect = () => {
    ws = new WebSocket(`${WS_BASE}/ws/${stream}`);
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        const k = msg.k;
        if (!k) return;
        onUpdate({
          time: Math.floor(k.t / 1000),
          open: +k.o,
          high: +k.h,
          low: +k.l,
          close: +k.c,
          volume: +k.v,
          takerBuyBaseVolume: +k.V,
          isFinal: k.x,
        });
      } catch {
        /* ignore malformed frame */
      }
    };
    ws.onclose = () => {
      if (!closedByUser) retryTimer = setTimeout(connect, 3000);
    };
    ws.onerror = () => ws.close();
  };
  connect();

  return () => {
    closedByUser = true;
    if (retryTimer) clearTimeout(retryTimer);
    if (ws) ws.close();
  };
}

/**
 * Подписка на "мини-тикер" по всем инструментам сразу (для сайдбара).
 * onBatch получает Map(symbol -> { lastPrice, priceChangePercent, quoteVolume }).
 */
export function subscribeAllMiniTickers(onBatch) {
  let ws;
  let closedByUser = false;
  let retryTimer = null;

  const connect = () => {
    ws = new WebSocket(`${WS_BASE}/ws/!ticker@arr`);
    ws.onmessage = (ev) => {
      try {
        const arr = JSON.parse(ev.data);
        const map = new Map();
        for (const t of arr) {
          if (!t.s || !t.s.endsWith("USDT")) continue;
          map.set(t.s, {
            lastPrice: +t.c,
            priceChangePercent: +t.P,
            quoteVolume: +t.q,
          });
        }
        onBatch(map);
      } catch {
        /* ignore malformed frame */
      }
    };
    ws.onclose = () => {
      if (!closedByUser) retryTimer = setTimeout(connect, 3000);
    };
    ws.onerror = () => ws.close();
  };
  connect();

  return () => {
    closedByUser = true;
    if (retryTimer) clearTimeout(retryTimer);
    if (ws) ws.close();
  };
}

export const INTERVALS = [
  { value: "1m", label: "1 минута" },
  { value: "5m", label: "5 минут" },
  { value: "15m", label: "15 минут" },
  { value: "1h", label: "1 час" },
  { value: "4h", label: "4 часа" },
  { value: "1d", label: "1 день" },
];
