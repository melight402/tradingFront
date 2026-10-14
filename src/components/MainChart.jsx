import { onMount, onCleanup, createEffect, on } from "solid-js";
import { createChart, CrosshairMode } from "lightweight-charts";
import { fetchKlines, subscribeKline } from "../api/binance";
import {
  symbol,
  mainInterval,
  activeTool,
  setActiveTool,
  drawingsFor,
  addDrawing,
  updateDrawing,
  removeDrawing,
  selectedId,
  setSelectedId,
  nextId,
  riskUsdt,
  orderType,
  tickers,
  instrumentInfo,
  showToast,
} from "../store/store";
import { positionSizeUSDT, rrRatio, clampStopEntry } from "../utils/risk";
import { formatPrice } from "../utils/format";
import { decimalPlaces, roundToStep } from "../utils/precision";

const HANDLE_R = 6;
const HANDLE_HIT = 10;
const LINE_HIT = 6;

const INTERVAL_SECONDS = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "4h": 14400,
  "1d": 86400,
};

const COLORS = {
  hline: "#5b7fd6",
  ray: "#c98bf0",
  trend: "#f5b45a",
  accent: "#4c8cff",
  long: "#2fd6a7",
  short: "#ff5d72",
  longGlow: "rgba(47, 214, 167, 0.16)",
  shortGlow: "rgba(255, 93, 114, 0.16)",
  handleFill: "#0d1219",
};

export default function MainChart() {
  let containerEl, canvasEl, chartEl;
  let chart, series, volSeries;
  let ro;
  let unsubWs = null;
  let candlePoll = null;
  let draft = null; // предпросмотр во время рисования (trendline второй клик и т.п.)
  let drag = null; // активное перетаскивание

  const activeInstrumentInfo = () => instrumentInfo[symbol()];
  const activeQuantityStep = () => {
    const info = activeInstrumentInfo();
    return orderType() === "market" || orderType() === "stop"
      ? info?.marketQuantityStep || info?.quantityStep
      : info?.quantityStep;
  };
  const snapPrice = (price) => roundToStep(price, activeInstrumentInfo()?.tickSize);
  const formatCurrentPrice = (price) => formatPrice(price, activeInstrumentInfo()?.tickSize);

  const toX = (t) => {
    try {
      return chart.timeScale().timeToCoordinate(t);
    } catch {
      return null;
    }
  };
  const toY = (p) => {
    try {
      return series.priceToCoordinate(p);
    } catch {
      return null;
    }
  };
  const fromX = (x) => {
    try {
      return chart.timeScale().coordinateToTime(x);
    } catch {
      return null;
    }
  };
  const fromY = (y) => {
    try {
      return series.coordinateToPrice(y);
    } catch {
      return null;
    }
  };

  function relCoords(e) {
    const r = containerEl.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function plotWidth() {
    try {
      const width = chart?.timeScale().width();
      if (Number.isFinite(width) && width > 0) return width;
    } catch {
      // Use the container while the chart is initializing.
    }
    return containerEl?.clientWidth || 0;
  }

  // ---------------------------------------------------------------- render
  function redraw() {
    if (!canvasEl || !chart || !series) return;
    const ctx = canvasEl.getContext("2d");
    const w = canvasEl.clientWidth;
    const h = canvasEl.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const draws = drawingsFor(symbol());
    for (const d of draws) {
      if (d.type === "hline") drawHLine(ctx, d, w);
      else if (d.type === "ray") drawRay(ctx, d, w);
      else if (d.type === "trendline") drawTrend(ctx, d);
      else if (d.type === "long" || d.type === "short") drawPosition(ctx, d, plotWidth());
    }
    if (draft) {
      if (draft.type === "trendline") drawTrend(ctx, draft, true);
    }
  }

  function label(ctx, x, y, text, color, align = "left") {
    ctx.font = "600 11px 'JetBrains Mono', monospace";
    const padX = 6;
    const tw = ctx.measureText(text).width;
    const bx = align === "left" ? x : x - tw - padX * 2;
    ctx.fillStyle = color;
    roundRect(ctx, bx, y - 9, tw + padX * 2, 18, 4);
    ctx.fill();
    ctx.fillStyle = "#0a0e14";
    ctx.fillText(text, bx + padX, y + 4);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawHLine(ctx, d, w) {
    const y = toY(d.price);
    if (y == null) return;
    const selected = d.id === selectedId();
    ctx.strokeStyle = selected ? COLORS.accent : COLORS.hline;
    ctx.lineWidth = selected ? 2 : 1.25;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
    label(ctx, w - 4, y, formatCurrentPrice(d.price), selected ? COLORS.accent : COLORS.hline, "right");
  }

  function drawRay(ctx, d, w) {
    const x0raw = toX(d.time);
    const y = toY(d.price);
    if (y == null) return;
    const x0 = x0raw == null ? 0 : Math.max(0, x0raw);
    const selected = d.id === selectedId();
    ctx.strokeStyle = selected ? COLORS.accent : COLORS.ray;
    ctx.lineWidth = selected ? 2 : 1.25;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
    if (x0raw != null) {
      ctx.fillStyle = selected ? COLORS.accent : COLORS.ray;
      ctx.beginPath();
      ctx.arc(x0raw, y, HANDLE_R, 0, Math.PI * 2);
      ctx.fill();
    }
    label(ctx, w - 4, y, formatCurrentPrice(d.price), selected ? COLORS.accent : COLORS.ray, "right");
  }

  function drawTrend(ctx, d, isDraft = false) {
    const x1 = toX(d.p1.time);
    const y1 = toY(d.p1.price);
    const x2 = toX(d.p2.time);
    const y2 = toY(d.p2.price);
    if (x1 == null || y1 == null || x2 == null || y2 == null) return;
    const selected = !isDraft && d.id === selectedId();
    ctx.strokeStyle = selected ? COLORS.accent : COLORS.trend;
    ctx.lineWidth = selected ? 2.25 : 1.5;
    ctx.setLineDash(isDraft ? [5, 4] : []);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    if (selected || isDraft) {
      ctx.fillStyle = selected ? COLORS.accent : COLORS.trend;
      for (const [px, py] of [[x1, y1], [x2, y2]]) {
        ctx.beginPath();
        ctx.arc(px, py, HANDLE_R, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawPosition(ctx, d, w) {
    const x1raw = toX(d.entryTime);
    const x2raw = toX(d.endTime);
    const yEntry = toY(d.entry);
    const yStop = toY(d.stop);
    const yPt = toY(d.pt);
    if (yEntry == null || yStop == null || yPt == null) return;
    const x1 = x1raw == null ? 0 : x1raw;
    const x2 = x2raw == null ? w - HANDLE_R - 2 : Math.min(w - HANDLE_R - 2, x2raw);
    if (x2 <= x1) return;
    const isLong = d.type === "long";
    const selected = d.id === selectedId();

    const profitTop = isLong ? yPt : yEntry;
    const profitBottom = isLong ? yEntry : yPt;
    const lossTop = isLong ? yEntry : yStop;
    const lossBottom = isLong ? yStop : yEntry;

    ctx.fillStyle = COLORS.longGlow;
    ctx.fillRect(x1, profitTop, x2 - x1, Math.max(1, profitBottom - profitTop));
    ctx.fillStyle = COLORS.shortGlow;
    ctx.fillRect(x1, lossTop, x2 - x1, Math.max(1, lossBottom - lossTop));

    const topY = Math.min(yPt, yStop);
    const botY = Math.max(yPt, yStop);
    ctx.strokeStyle = selected ? COLORS.accent : "rgba(255,255,255,0.22)";
    ctx.lineWidth = selected ? 2 : 1;
    ctx.strokeRect(x1, topY, x2 - x1, botY - topY);

    // пунктирные уровни
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    for (const [y, c] of [
      [yEntry, COLORS.accent],
      [yPt, COLORS.long],
      [yStop, COLORS.short],
    ]) {
      ctx.strokeStyle = c;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    label(ctx, x2 + 4, yPt, `PT ${formatCurrentPrice(d.pt)}`, COLORS.long);
    label(ctx, x2 + 4, yEntry, `Вход ${formatCurrentPrice(d.entry)}`, COLORS.accent);
    label(ctx, x2 + 4, yStop, `Стоп ${formatCurrentPrice(d.stop)}`, COLORS.short);

    const ratio = rrRatio(d.entry, d.stop, d.pt);
    const size = positionSizeUSDT(riskUsdt(), d.entry, d.stop, activeQuantityStep());
    const centerY = (yEntry + (isLong ? yPt : yStop)) / 2;
    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#e7edf5";
    const txt = `${ratio.toFixed(2)}:1  •  ${size.toFixed(2)} USDT`;
    const tw = ctx.measureText(txt).width;
    const cx = Math.min(Math.max(x1 + (x2 - x1) / 2 - tw / 2, x1 + 4), x2 - tw - 4);
    ctx.fillStyle = "rgba(10,14,20,0.72)";
    roundRect(ctx, cx - 6, centerY - 11, tw + 12, 22, 5);
    ctx.fill();
    ctx.fillStyle = "#e7edf5";
    ctx.fillText(txt, cx, centerY + 4);

    // ручки
    const handles = [
      { x: x1, y: yEntry, c: COLORS.accent },
      { x: x2, y: yPt, c: COLORS.long },
      { x: x2, y: yStop, c: COLORS.short },
      { x: x2, y: (topY + botY) / 2, c: COLORS.accent },
    ];
    for (const hnd of handles) {
      ctx.fillStyle = COLORS.handleFill;
      ctx.beginPath();
      ctx.arc(hnd.x, hnd.y, HANDLE_R + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = hnd.c;
      ctx.beginPath();
      ctx.arc(hnd.x, hnd.y, HANDLE_R, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ------------------------------------------------------------- hit test
  function hitTest(x, y) {
    const draws = drawingsFor(symbol());
    for (let i = draws.length - 1; i >= 0; i--) {
      const d = draws[i];
      if (d.type === "long" || d.type === "short") {
        const x1raw = toX(d.entryTime);
        const x2raw = toX(d.endTime);
        const yEntry = toY(d.entry);
        const yStop = toY(d.stop);
        const yPt = toY(d.pt);
        if (yEntry == null || yStop == null || yPt == null) continue;
        const x1 = x1raw == null ? 0 : x1raw;
        const rightEdge = plotWidth() - HANDLE_R - 2;
        const x2 = x2raw == null ? rightEdge : Math.min(rightEdge, x2raw);
        if (dist(x, y, x1, yEntry) <= HANDLE_HIT) return { id: d.id, mode: "position-entry" };
        if (dist(x, y, x2, yPt) <= HANDLE_HIT) return { id: d.id, mode: "position-pt" };
        if (dist(x, y, x2, yStop) <= HANDLE_HIT) return { id: d.id, mode: "position-stop" };
        const top = Math.min(yPt, yStop);
        const bot = Math.max(yPt, yStop);
        if (dist(x, y, x2, (top + bot) / 2) <= HANDLE_HIT) return { id: d.id, mode: "position-end" };
        if (x >= x1 && x <= x2 && Math.abs(y - yPt) <= LINE_HIT) {
          return { id: d.id, mode: "position-pt" };
        }
        if (x >= x1 && x <= x2 && Math.abs(y - yStop) <= LINE_HIT) {
          return { id: d.id, mode: "position-stop" };
        }
        if (x >= x1 && x <= x2 && y >= top && y <= bot) {
          return { id: d.id, mode: "position-body", anchorTime: fromX(x), anchorPrice: fromY(y) };
        }
      } else if (d.type === "hline") {
        const y0 = toY(d.price);
        if (y0 != null && Math.abs(y - y0) <= LINE_HIT) return { id: d.id, mode: "hline-price" };
      } else if (d.type === "ray") {
        const x0raw = toX(d.time);
        const y0 = toY(d.price);
        if (y0 == null) continue;
        const x0 = x0raw == null ? 0 : x0raw;
        if (x0raw != null && dist(x, y, x0, y0) <= HANDLE_HIT) return { id: d.id, mode: "ray-anchor" };
        if (x >= x0 && Math.abs(y - y0) <= LINE_HIT) {
          return { id: d.id, mode: "ray-body", anchorTime: fromX(x), anchorPrice: fromY(y) };
        }
      } else if (d.type === "trendline") {
        const x1 = toX(d.p1.time), y1 = toY(d.p1.price);
        const x2 = toX(d.p2.time), y2 = toY(d.p2.price);
        if (x1 == null || y1 == null || x2 == null || y2 == null) continue;
        if (dist(x, y, x1, y1) <= HANDLE_HIT) return { id: d.id, mode: "trend-p1" };
        if (dist(x, y, x2, y2) <= HANDLE_HIT) return { id: d.id, mode: "trend-p2" };
        if (segDist(x, y, x1, y1, x2, y2) <= LINE_HIT) {
          return { id: d.id, mode: "trend-body", anchorTime: fromX(x), anchorPrice: fromY(y) };
        }
      }
    }
    return null;
  }
  function dist(x, y, x2, y2) {
    return Math.hypot(x - x2, y - y2);
  }
  function segDist(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const len2 = dx * dx + dy * dy || 1;
    let t = ((px - x1) * dx + (py - y1) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    return dist(px, py, x1 + t * dx, y1 + t * dy);
  }

  // ------------------------------------------------------------ pointer IO
  function onPointerDown(e) {
    if (!chart) return;
    const { x, y } = relCoords(e);
    const tool = activeTool();

    if (tool === "cursor") {
      const hit = hitTest(x, y);
      if (!hit) {
        setSelectedId(null);
        return; // пропускаем событие дальше — обычный пан/зум графика
      }
      e.preventDefault();
      e.stopPropagation();
      setSelectedId(hit.id);
      drag = { ...hit };
      if (hit.mode.endsWith("body")) {
        const found = drawingsFor(symbol()).find((d) => d.id === hit.id);
        drag.original = JSON.parse(JSON.stringify(found));
      }
      return;
    }

    if (!activeInstrumentInfo()?.tickSize) {
      showToast("Загружаются биржевые параметры инструмента", "warn");
      return;
    }

    // режим рисования — всегда перехватываем клик
    e.preventDefault();
    e.stopPropagation();
    const time = fromX(x);
    const price = snapPrice(fromY(y));
    if (time == null || price == null) return;

    if (tool === "hline") {
      addDrawing(symbol(), { id: nextId(), type: "hline", price });
      setActiveTool("cursor");
    } else if (tool === "ray") {
      addDrawing(symbol(), { id: nextId(), type: "ray", time, price });
      setActiveTool("cursor");
    } else if (tool === "trendline") {
      if (!draft) {
        draft = { type: "trendline", p1: { time, price }, p2: { time, price } };
      } else {
        const d = addDrawing(symbol(), {
          id: nextId(),
          type: "trendline",
          p1: draft.p1,
          p2: { time, price },
        });
        draft = null;
        setActiveTool("cursor");
        setSelectedId(d.id);
      }
    } else if (tool === "long" || tool === "short") {
      const step = INTERVAL_SECONDS[mainInterval()] || 300;
      const isLong = tool === "long";
      let entryPrice = price;
      if (orderType() === "stop") {
        const marketPrice = tickers[symbol()]?.lastPrice;
        const clamped = snapPrice(clampStopEntry(isLong, entryPrice, marketPrice, activeInstrumentInfo()?.tickSize));
        if (clamped !== entryPrice) {
          showToast(
            `Стоп-ордер: цена входа скорректирована ${isLong ? "выше" : "ниже"} рыночной (${formatCurrentPrice(marketPrice)})`,
            "warn"
          );
          entryPrice = clamped;
        }
      }
      const stopOffset = entryPrice * 0.005;
      const stop = snapPrice(isLong ? entryPrice - stopOffset : entryPrice + stopOffset);
      const pt = snapPrice(isLong ? entryPrice + stopOffset * 2 : entryPrice - stopOffset * 2);
      const d = addDrawing(symbol(), {
        id: nextId(),
        type: tool,
        entryTime: time,
        endTime: time + step * 40,
        entry: entryPrice,
        stop,
        pt,
        note: "",
        pnlMode: "profit",
      });
      setSelectedId(d.id);
      setActiveTool("cursor");
      drag = null;
    }
    redraw();
  }

  function onPointerMove(e) {
    const { x, y } = relCoords(e);

    if (activeTool() === "trendline" && draft) {
      e.preventDefault();
      e.stopPropagation();
      const time = fromX(x);
      const price = snapPrice(fromY(y));
      if (time != null && price != null) draft.p2 = { time, price };
      redraw();
      return;
    }

    if (!drag) return;
    e.preventDefault();
    e.stopPropagation();
    const time = fromX(x);
    const price = snapPrice(fromY(y));
    if (time == null || price == null) return;

    const sym = symbol();
    switch (drag.mode) {
      case "hline-price":
        updateDrawing(sym, drag.id, { price });
        break;
      case "position-entry": {
        let newEntry = price;
        if (orderType() === "stop") {
          const d = drawingsFor(sym).find((x) => x.id === drag.id);
          const isLong = d?.type === "long";
          const marketPrice = tickers[sym]?.lastPrice;
          newEntry = snapPrice(clampStopEntry(isLong, newEntry, marketPrice, activeInstrumentInfo()?.tickSize));
        }
        updateDrawing(sym, drag.id, { entry: newEntry });
        break;
      }
      case "position-stop":
        updateDrawing(sym, drag.id, { stop: price });
        break;
      case "position-pt":
        updateDrawing(sym, drag.id, { pt: price });
        break;
      case "position-end": {
        const d = drawingsFor(sym).find((item) => item.id === drag.id);
        if (d) {
          const step = INTERVAL_SECONDS[mainInterval()] || 300;
          updateDrawing(sym, drag.id, {
            endTime: Math.max(time, d.entryTime + step),
          });
        }
        break;
      }
      case "position-body": {
        const dt = time - drag.anchorTime;
        const dp = price - drag.anchorPrice;
        const o = drag.original;
        updateDrawing(sym, drag.id, {
          entryTime: o.entryTime + dt,
          endTime: o.endTime + dt,
          entry: snapPrice(o.entry + dp),
          stop: snapPrice(o.stop + dp),
          pt: snapPrice(o.pt + dp),
        });
        break;
      }
      case "ray-anchor":
        updateDrawing(sym, drag.id, { time, price });
        break;
      case "ray-body": {
        const dt = time - drag.anchorTime;
        const dp = price - drag.anchorPrice;
        const o = drag.original || {};
        const base = o.time != null ? o : drawingsFor(sym).find((d) => d.id === drag.id);
        if (!drag.original) drag.original = JSON.parse(JSON.stringify(base));
        updateDrawing(sym, drag.id, { time: drag.original.time + dt, price: drag.original.price + dp });
        break;
      }
      case "trend-p1":
        updateDrawing(sym, drag.id, { p1: { time, price } });
        break;
      case "trend-p2":
        updateDrawing(sym, drag.id, { p2: { time, price } });
        break;
      case "trend-body": {
        const dt = time - drag.anchorTime;
        const dp = price - drag.anchorPrice;
        const o = drag.original;
        updateDrawing(sym, drag.id, {
          p1: { time: o.p1.time + dt, price: o.p1.price + dp },
          p2: { time: o.p2.time + dt, price: o.p2.price + dp },
        });
        break;
      }
      default:
        break;
    }
    redraw();
  }

  function onPointerUp(e) {
    if (drag) {
      e.preventDefault();
      e.stopPropagation();
      drag = null;
      setActiveTool("cursor");
    }
  }

  function onKeyDown(e) {
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if ((e.key === "Delete" || e.key === "Backspace") && selectedId()) {
      removeDrawing(symbol(), selectedId());
      redraw();
    }
    if (e.key === "Escape") {
      draft = null;
      setActiveTool("cursor");
      setSelectedId(null);
      redraw();
    }
  }

  // ------------------------------------------------------------- lifecycle
  onMount(() => {
    chart = createChart(chartEl, {
      layout: { background: { color: "transparent" }, textColor: "#8a99ab", attributionLogo: false },
      grid: {
        vertLines: { color: "#141b25" },
        horzLines: { color: "#141b25" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "#202a37" },
      timeScale: { borderColor: "#202a37", timeVisible: true, secondsVisible: false },
      width: containerEl.clientWidth,
      height: containerEl.clientHeight,
    });

    const tickSize = activeInstrumentInfo()?.tickSize || 0.00000001;
    series = chart.addCandlestickSeries({
      upColor: "#2fd6a7",
      downColor: "#ff5d72",
      borderVisible: false,
      wickUpColor: "#2fd6a7",
      wickDownColor: "#ff5d72",
      priceScaleId: "right",
      priceFormat: { type: "price", precision: Math.min(8, decimalPlaces(tickSize)), minMove: tickSize },
    });
    series.priceScale().applyOptions({ scaleMargins: { top: 0.08, bottom: 0.24 } });

    volSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
      color: "#2c3a4a",
    });
    volSeries.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });

    chart.timeScale().subscribeVisibleTimeRangeChange(redraw);
    chart.timeScale().subscribeVisibleLogicalRangeChange(redraw);
    chart.subscribeCrosshairMove(redraw);

    ro = new ResizeObserver(() => {
      const w = containerEl.clientWidth;
      const h = containerEl.clientHeight;
      chart.resize(w, h);
      const dpr = window.devicePixelRatio || 1;
      canvasEl.width = w * dpr;
      canvasEl.height = h * dpr;
      canvasEl.style.width = w + "px";
      canvasEl.style.height = h + "px";
      canvasEl.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    });
    ro.observe(containerEl);

    containerEl.addEventListener("pointerdown", onPointerDown, { capture: true });
    containerEl.addEventListener("pointermove", onPointerMove, { capture: true });
    window.addEventListener("pointerup", onPointerUp, { capture: true });
    window.addEventListener("keydown", onKeyDown);

    loadData();
  });

  onCleanup(() => {
    ro?.disconnect();
    containerEl?.removeEventListener("pointerdown", onPointerDown, { capture: true });
    containerEl?.removeEventListener("pointermove", onPointerMove, { capture: true });
    window.removeEventListener("pointerup", onPointerUp, { capture: true });
    window.removeEventListener("keydown", onKeyDown);
    unsubWs?.();
    clearInterval(candlePoll);
    chart?.remove();
  });

  async function loadData() {
    unsubWs?.();
    unsubWs = null;
    clearInterval(candlePoll);
    candlePoll = null;
    const sym = symbol();
    const interval = mainInterval();
    try {
      const candles = await fetchKlines(sym, interval, 500);
      if (sym !== symbol() || interval !== mainInterval()) return; // символ уже сменился, пока грузили
      series.setData(candles.map((c) => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close })));
      volSeries.setData(
        candles.map((c) => ({
          time: c.time,
          value: c.volume,
          color: c.close >= c.open ? "rgba(47,214,167,0.5)" : "rgba(255,93,114,0.5)",
        }))
      );
      chart.timeScale().fitContent();
      redraw();

      unsubWs = subscribeKline(sym, interval, (c) => {
        if (sym !== symbol() || interval !== mainInterval()) return;
        series.update({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close });
        volSeries.update({
          time: c.time,
          value: c.volume,
          color: c.close >= c.open ? "rgba(47,214,167,0.5)" : "rgba(255,93,114,0.5)",
        });
        redraw();
      });

      candlePoll = setInterval(async () => {
        try {
          const [latest] = await fetchKlines(sym, interval, 1);
          if (!latest || sym !== symbol() || interval !== mainInterval()) return;
          series.update({ time: latest.time, open: latest.open, high: latest.high, low: latest.low, close: latest.close });
          volSeries.update({
            time: latest.time,
            value: latest.volume,
            color: latest.close >= latest.open ? "rgba(47,214,167,0.5)" : "rgba(255,93,114,0.5)",
          });
          redraw();
        } catch {
          // The WebSocket remains active; retry on the next polling interval.
        }
      }, 3000);
    } catch (err) {
      console.error("Не удалось загрузить свечи:", err);
    }
  }

  createEffect(on([symbol, mainInterval], () => loadData(), { defer: true }));
  createEffect(() => {
    const tickSize = activeInstrumentInfo()?.tickSize;
    if (!series || !tickSize) return;
    const precision = Math.min(8, decimalPlaces(tickSize));
    series.applyOptions({ priceFormat: { type: "price", precision, minMove: tickSize } });
  });
  createEffect(() => {
    // перерисовка при смене риска / выбора / инструмента, тянет актуальные размеры позиций
    riskUsdt();
    selectedId();
    activeTool();
    redraw();
  });

  return (
    <div
      ref={containerEl}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        cursor:
          activeTool() === "cursor" ? "default" : "crosshair",
      }}
    >
      <div ref={chartEl} style={{ position: "absolute", inset: 0 }} />
      <canvas
        id="main-drawing-canvas"
        ref={canvasEl}
        style={{ position: "absolute", inset: 0, "pointer-events": "none" }}
      />
    </div>
  );
}
