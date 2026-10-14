import { createSignal } from "solid-js";
import { createStore, produce } from "solid-js/store";

const STORAGE_KEYS = {
  symbol: "riskbox.symbol",
  riskUsdt: "riskbox.riskUsdt",
  mainInterval: "riskbox.mainInterval",
};

const VALID_INTERVALS = new Set(["1m", "5m", "15m", "1h", "4h", "1d"]);

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

// ---- выбранный инструмент и таймфрейм графика ----
const storedSymbol = readStorage(STORAGE_KEYS.symbol);
const initialSymbol = storedSymbol && /^[^\s/]+$/u.test(storedSymbol) ? storedSymbol : "BTCUSDT";
export const [symbol, setStoredSymbol] = createSignal(initialSymbol);
export function setSymbol(value) {
  setStoredSymbol(value);
  writeStorage(STORAGE_KEYS.symbol, value);
}

const storedInterval = readStorage(STORAGE_KEYS.mainInterval);
const initialInterval = VALID_INTERVALS.has(storedInterval) ? storedInterval : "5m";
export const [mainInterval, setStoredInterval] = createSignal(initialInterval);
export function setMainInterval(value) {
  if (!VALID_INTERVALS.has(value)) return;
  setStoredInterval(value);
  writeStorage(STORAGE_KEYS.mainInterval, value);
}

// ---- параметры риска и заявки (шапка) ----
const storedRisk = Number(readStorage(STORAGE_KEYS.riskUsdt));
const initialRisk = Number.isFinite(storedRisk) ? Math.max(0.01, storedRisk) : 0.1;
export const [riskUsdt, setStoredRiskUsdt] = createSignal(initialRisk); // минимум 0.01 USDT
export function setRiskUsdt(value) {
  const normalized = Number.isFinite(value) ? Math.max(0.01, value) : 0.01;
  setStoredRiskUsdt(normalized);
  writeStorage(STORAGE_KEYS.riskUsdt, normalized);
}
export const [leverage, setLeverage] = createSignal(10);
export const [orderType, setOrderType] = createSignal("limit"); // limit | market
export const [patternTag, setPatternTag] = createSignal("");

// ---- инструмент рисования ----
// cursor | hline | ray | trendline | long | short
export const [activeTool, setActiveTool] = createSignal("cursor");

// ---- сайдбар со списком пар ----
export const [sidebarOpen, setSidebarOpen] = createSignal(true);

// ---- рисунки, сгруппированные по символу: { BTCUSDT: [ {id,type,...} ] } ----
export const [drawingsBySymbol, setDrawingsBySymbol] = createStore({});
export const [selectedId, setSelectedId] = createSignal(null);

export function drawingsFor(sym) {
  return drawingsBySymbol[sym] || [];
}

/** Реактивный геттер текущего выбранного рисунка (или null). */
export function selectedDrawing() {
  const id = selectedId();
  if (id == null) return null;
  return drawingsFor(symbol()).find((d) => d.id === id) || null;
}

export function addDrawing(sym, drawing) {
  setDrawingsBySymbol(
    produce((s) => {
      if (!s[sym]) s[sym] = [];
      s[sym].push(drawing);
    })
  );
  setSelectedId(drawing.id);
  return drawing;
}

export function updateDrawing(sym, id, patch) {
  setDrawingsBySymbol(sym, (d) => d.id === id, patch);
}

export function removeDrawing(sym, id) {
  setDrawingsBySymbol(
    sym,
    produce((arr) => {
      const idx = arr.findIndex((d) => d.id === id);
      if (idx !== -1) arr.splice(idx, 1);
    })
  );
  if (selectedId() === id) setSelectedId(null);
}

export function clearDrawings(sym) {
  setDrawingsBySymbol(sym, []);
  setSelectedId(null);
}

let idCounter = 1;
export function nextId() {
  return `d${Date.now()}_${idCounter++}`;
}

// ---- журнал открытых/закрытых позиций (локальная имитация, без реальных ордеров) ----
export const [positions, setPositions] = createStore([]);

export function openPositionFromDrawing(drawing, quantity, stopOrderId) {
  const pos = {
    id: nextId(),
    symbol: symbol(),
    side: drawing.type, // 'long' | 'short'
    entry: drawing.entry,
    stop: drawing.stop,
    pt: drawing.pt,
    sizeUsdt: quantity * drawing.entry,
    riskUsdt: riskUsdt(),
    quantity,
    stopOrderId,
    note: drawing.note || "",
    pnlMode: drawing.pnlMode || "profit",
    status: "open",
    openedAt: Date.now(),
  };
  setPositions(produce((arr) => arr.unshift(pos)));
  return pos;
}

export function closePosition(id) {
  setPositions(
    (p) => p.id === id,
    produce((p) => {
      p.status = "closed";
      p.closedAt = Date.now();
    })
  );
}

// ---- live рыночные данные для сайдбара: symbol -> {lastPrice, priceChangePercent, quoteVolume} ----
export const [tickers, setTickers] = createStore({});
export const [instrumentInfo, setInstrumentInfo] = createStore({});

// ---- лёгкие всплывающие уведомления ----
export const [toast, setToast] = createSignal(null); // { text, kind } | null
let toastTimer = null;
export function showToast(text, kind = "info") {
  setToast({ text, kind });
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => setToast(null), 2600);
}

// ---- панель списка позиций ----
export const [positionsPanelOpen, setPositionsPanelOpen] = createSignal(false);
