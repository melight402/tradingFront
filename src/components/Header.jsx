import { createMemo, createSignal, For, onMount, Show } from "solid-js";
import {
  symbol,
  orderType,
  setOrderType,
  patternTag,
  setPatternTag,
  mainInterval,
  setMainInterval,
  riskUsdt,
  setRiskUsdt,
  leverage,
  setLeverage,
  selectedDrawing,
  updateDrawing,
  openPositionFromDrawing,
  closePosition,
  positions,
  sidebarOpen,
  setSidebarOpen,
  showToast,
  positionsPanelOpen,
  setPositionsPanelOpen,
  tickers,
  instrumentInfo,
} from "../store/store";
import { INTERVALS } from "../api/binance";
import { formatPrice } from "../utils/format";
import { roundToStep } from "../utils/precision";
import { closeLivePosition, openLivePosition } from "../utils/binanceOrder";
import { fetchStrategies } from "../api/strategies";
import StrategySelect from "./StrategySelect";
import Toolbar from "./Toolbar";
import PositionsPanel from "./PositionsPanel";
import { IconLayers } from "./Icons";

const LEVERAGES = [1, 2, 3, 5, 10, 20, 25, 50, 75, 100];

function fieldLabelStyle() {
  return { "font-size": "10px", color: "var(--text-tertiary)", "margin-bottom": "3px", "font-weight": "600", "letter-spacing": "0.02em" };
}
function inputStyle(extra = {}) {
  return {
    background: "var(--bg-input)",
    border: "1px solid var(--border-hair)",
    "border-radius": "6px",
    color: "var(--text-primary)",
    padding: "6px 8px",
    "font-size": "12px",
    ...extra,
  };
}

export default function Header() {
  const [strategies, setStrategies] = createSignal([]);
  const sel = createMemo(selectedDrawing);
  const posSel = createMemo(() => {
    const d = sel();
    return d && (d.type === "long" || d.type === "short") ? d : null;
  });
  const openCount = createMemo(() => positions.filter((p) => p.status === "open").length);
  const lastPrice = createMemo(() => tickers[symbol()]?.lastPrice);
  const quantityStep = () => {
    const info = instrumentInfo[symbol()];
    return orderType() === "market" || orderType() === "stop"
      ? info?.marketQuantityStep || info?.quantityStep
      : info?.quantityStep;
  };
  const selectedStrategy = createMemo(() => strategies().find((strategy) => strategy.value === patternTag()));

  onMount(() => {
    fetchStrategies().then(setStrategies).catch(() => showToast("Не удалось загрузить стратегии", "warn"));
  });

  async function handleOpenPosition() {
    const d = posSel();
    if (!d) {
      showToast("Сначала выделите нарисованную позицию (Long/Short) на графике", "warn");
      return;
    }
    if (orderType() !== "market") {
      showToast("Отложенный вход отключен: приложение пока не гарантирует защитный стоп после исполнения", "warn");
      return;
    }
    try {
      const result = await openLivePosition({ symbol: symbol(), side: d.type, orderType: orderType(), entry: d.entry, stop: d.stop, riskUsdt: riskUsdt(), quantityStep: quantityStep() });
      if (result.stopLossPending) {
        showToast('Отложенный вход создан. Стоп-лосс будет установлен после исполнения входа.', 'ok');
        return;
      }
      openPositionFromDrawing(d, result.quantity, result.stopOrder?.algoId);
      showToast(`Реальная позиция ${d.type === "long" ? "Long" : "Short"} по ${symbol()} открыта, стоп установлен`, "ok");
    } catch (error) {
      showToast(error.message, "warn");
    }
  }

  async function handleClosePosition() {
    const open = positions.find((p) => p.status === "open" && p.symbol === symbol());
    if (!open) {
      showToast("Нет открытых позиций по этому инструменту", "warn");
      return;
    }
    try {
      await closeLivePosition({ symbol: open.symbol, side: open.side, quantity: open.quantity, stopOrderId: open.stopOrderId });
      closePosition(open.id);
      showToast(`Позиция по ${symbol()} закрыта по рынку`, "ok");
    } catch (error) {
      showToast(error.message, "warn");
    }
  }

  async function quickMarket(side) {
    if (orderType() !== "market") {
      showToast("Buy / Sell выполняют вход по рынку. Выберите Market, чтобы продолжить", "warn");
      return;
    }
    const price = lastPrice();
    if (!price) {
      showToast("Нет рыночной цены — подождите загрузку котировок", "warn");
      return;
    }
    const isLong = side === "long";
    const tickSize = instrumentInfo[symbol()]?.tickSize;
    if (!tickSize) {
      showToast("Загружаются биржевые параметры инструмента", "warn");
      return;
    }
    const stop = roundToStep(isLong ? price * 0.995 : price * 1.005, tickSize);
    const pt = roundToStep(isLong ? price * 1.01 : price * 0.99, tickSize);
    const fakeDrawing = { type: side, entry: price, stop, pt, note: "быстрый вход по рынку", pnlMode: "profit" };
    try {
      const result = await openLivePosition({ symbol: symbol(), side, orderType: "market", entry: price, stop, riskUsdt: riskUsdt(), quantityStep: instrumentInfo[symbol()]?.marketQuantityStep || instrumentInfo[symbol()]?.quantityStep });
      if (result.stopLossPending) {
        showToast('Отложенный вход создан. Стоп-лосс будет установлен после исполнения входа.', 'ok');
        return;
      }
      openPositionFromDrawing(fakeDrawing, result.quantity, result.stopOrder?.algoId);
      showToast(`${isLong ? "Buy" : "Sell"} по рынку: ${symbol()} @ ${formatPrice(price)}, стоп установлен`, "ok");
    } catch (error) {
      showToast(error.message, "warn");
    }
  }

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        background: "var(--bg-panel)",
        "border-bottom": "1px solid var(--border-hair)",
        "flex-shrink": 0,
        position: "relative",
      }}
    >
      {/* ---- ряд 1: инструмент, тип ордера, инструменты рисования, риск, плечо ---- */}
      <div style={{ display: "flex", "align-items": "flex-end", gap: "14px", padding: "8px 14px 8px" }}>
        <div style={{ display: "flex", "align-items": "center", gap: "8px", "padding-bottom": "4px" }}>
          <div
            style={{
              width: "22px",
              height: "22px",
              "border-radius": "6px",
              background: "linear-gradient(135deg, var(--long), var(--accent))",
              "flex-shrink": 0,
            }}
          />
          <div style={{ display: "flex", "flex-direction": "column", "line-height": 1.1 }}>
            <span style={{ "font-weight": "700", "font-size": "13px" }}>{symbol()}</span>
            <span class="num" style={{ "font-size": "11px", color: "var(--text-secondary)" }}>
              {lastPrice() ? formatPrice(lastPrice(), instrumentInfo[symbol()]?.tickSize) : "—"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", "flex-direction": "column" }}>
          <span style={fieldLabelStyle()}>Тип ордера</span>
          <select
            value={orderType()}
            onChange={(e) => setOrderType(e.target.value)}
            title={
              orderType() === "stop"
                ? "Стоп-ордер: цена входа должна быть выше рыночной для Long и ниже рыночной для Short (вход на продолжении пробоя)"
                : undefined
            }
            style={inputStyle({ width: "132px" })}
          >
            <option value="limit">Лимит ордер</option>
            <option value="market">Маркет ордер</option>
            <option value="stop">Стоп ордер</option>
          </select>
        </div>

        <div style={{ display: "flex", "flex-direction": "column" }}>
          <span style={fieldLabelStyle()}>Таймфрейм</span>
          <select value={mainInterval()} onChange={(e) => setMainInterval(e.target.value)} style={inputStyle({ width: "104px" })}>
            <For each={INTERVALS}>{(iv) => <option value={iv.value}>{iv.label}</option>}</For>
          </select>
        </div>

        <div style={{ display: "flex", "flex-direction": "column" }}>
          <span style={fieldLabelStyle()}>Инструменты рисования</span>
          <Toolbar />
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", "flex-direction": "column" }}>
          <span style={fieldLabelStyle()}>Риск, USDT</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={riskUsdt()}
            onInput={(e) => {
              const v = parseFloat(e.target.value);
              setRiskUsdt(Number.isNaN(v) ? 0.01 : Math.max(0.01, v));
            }}
            style={inputStyle({ width: "96px", "font-family": "var(--font-data)", "font-weight": "600" })}
          />
        </div>

        <div style={{ display: "flex", "flex-direction": "column" }}>
          <span style={fieldLabelStyle()}>Плечо</span>
          <select
            value={leverage()}
            onChange={(e) => setLeverage(+e.target.value)}
            style={inputStyle({ width: "76px" })}
          >
            <For each={LEVERAGES}>{(l) => <option value={l}>1:{l}</option>}</For>
          </select>
        </div>

        <div style={{ position: "relative" }}>
          <span style={fieldLabelStyle()}>&nbsp;</span>
          <button
            onClick={() => setPositionsPanelOpen(!positionsPanelOpen())}
            style={{
              display: "flex",
              "align-items": "center",
              gap: "6px",
              height: "31px",
              padding: "0 10px",
              "border-radius": "6px",
              border: "1px solid var(--border-hair)",
              background: positionsPanelOpen() ? "var(--bg-elevated-hover)" : "var(--bg-elevated)",
              color: "var(--text-primary)",
              "font-size": "12px",
            }}
          >
            <IconLayers width="14" height="14" />
            Позиции
            <span
              style={{
                background: openCount() ? "var(--accent-dim)" : "var(--bg-input)",
                color: openCount() ? "var(--accent)" : "var(--text-tertiary)",
                "border-radius": "10px",
                padding: "0 6px",
                "font-size": "10.5px",
                "font-weight": "700",
              }}
            >
              {openCount()}
            </span>
          </button>
          {positionsPanelOpen() && <PositionsPanel />}
        </div>

        <div style={{ display: "flex", "flex-direction": "column" }}>
          <span style={fieldLabelStyle()}>&nbsp;</span>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen())}
            title="Показать / скрыть список пар"
            style={{
              height: "31px",
              padding: "0 12px",
              "border-radius": "6px",
              border: "1px solid var(--border-hair)",
              background: sidebarOpen() ? "var(--accent-dim)" : "var(--bg-elevated)",
              color: sidebarOpen() ? "var(--accent)" : "var(--text-secondary)",
              "font-size": "12px",
              "font-weight": "600",
            }}
          >
            Пары
          </button>
        </div>
      </div>

      {/* ---- ряд 2: параметры активной позиции ---- */}
      <div
        style={{
          display: "flex",
          "align-items": "flex-end",
          gap: "12px",
          padding: "0 14px 10px",
          opacity: posSel() ? 1 : 0.55,
        }}
      >
        <div style={{ display: "flex", "flex-direction": "column" }}>
          <span style={fieldLabelStyle()}>Паттерн</span>
          <StrategySelect options={strategies()} value={patternTag()} onChange={(value) => setPatternTag(value)} />
        </div>

        <div style={{ display: "flex", "flex-direction": "column" }}>
          <span style={fieldLabelStyle()}>Стоп цена</span>
          <input
            type="number"
            disabled={!posSel()}
            value={posSel() ? posSel().stop : ""}
            onInput={(e) => {
              const v = parseFloat(e.target.value);
              if (!Number.isNaN(v) && posSel()) updateDrawing(symbol(), posSel().id, { stop: v });
            }}
            style={inputStyle({ width: "116px", "font-family": "var(--font-data)" })}
          />
        </div>

        <div style={{ display: "flex", "flex-direction": "column" }}>
          <span style={fieldLabelStyle()}>Прибыль / убыток</span>
          <select
            disabled={!posSel()}
            value={posSel() ? posSel().pnlMode : "profit"}
            onChange={(e) => posSel() && updateDrawing(symbol(), posSel().id, { pnlMode: e.target.value })}
            style={inputStyle({ width: "120px" })}
          >
            <option value="profit">Прибыль</option>
            <option value="loss">Убыток</option>
          </select>
        </div>

        <div style={{ display: "flex", "flex-direction": "column", flex: "1 1 200px", "max-width": "360px" }}>
          <span style={fieldLabelStyle()}>Заметка</span>
          <input
            disabled={!posSel()}
            value={posSel() ? posSel().note : ""}
            onInput={(e) => posSel() && updateDrawing(symbol(), posSel().id, { note: e.target.value })}
            placeholder="комментарий к сделке"
            style={inputStyle({ width: "100%" })}
          />
        </div>

        <button
          onClick={handleOpenPosition}
          disabled={orderType() !== "market"}
          title={orderType() === "market" ? "Открыть позицию по текущей рыночной цене" : "Отложенные входы временно отключены"}
          style={{
            height: "31px",
            padding: "0 14px",
            "border-radius": "6px",
            border: "1px solid var(--border-hair)",
            background: "var(--bg-elevated)",
            color: "var(--text-primary)",
            "font-size": "12px",
            "font-weight": "600",
            opacity: orderType() === "market" ? 1 : 0.45,
            cursor: orderType() === "market" ? "pointer" : "not-allowed",
          }}
        >
          Открыть позицию
        </button>
        <button
          onClick={handleClosePosition}
          style={{
            height: "31px",
            padding: "0 14px",
            "border-radius": "6px",
            border: "1px solid var(--border-hair)",
            background: "var(--bg-elevated)",
            color: "var(--text-secondary)",
            "font-size": "12px",
            "font-weight": "600",
          }}
        >
          Закрыть позицию
        </button>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => quickMarket("long")}
          disabled={orderType() !== "market"}
          title={orderType() === "market" ? "Рыночный Buy/Long с защитным стопом" : "Доступно только при типе ордера Market"}
          style={{
            height: "34px",
            padding: "0 22px",
            "border-radius": "6px",
            border: "none",
            background: "var(--long)",
            color: "#06231b",
            "font-size": "13px",
            "font-weight": "700",
            opacity: orderType() === "market" ? 1 : 0.45,
            cursor: orderType() === "market" ? "pointer" : "not-allowed",
          }}
        >
          Buy / Long
        </button>
        <button
          onClick={() => quickMarket("short")}
          disabled={orderType() !== "market"}
          title={orderType() === "market" ? "Рыночный Sell/Short с защитным стопом" : "Доступно только при типе ордера Market"}
          style={{
            height: "34px",
            padding: "0 22px",
            "border-radius": "6px",
            border: "none",
            background: "var(--short)",
            color: "#2b060c",
            "font-size": "13px",
            "font-weight": "700",
            opacity: orderType() === "market" ? 1 : 0.45,
            cursor: orderType() === "market" ? "pointer" : "not-allowed",
          }}
        >
          Sell / Short
        </button>
      </div>

      <Show when={orderType() !== "market"}>
        <div
          style={{
            display: "flex",
            "align-items": "center",
            gap: "6px",
            padding: "5px 14px",
            "border-top": "1px solid var(--border-hair)",
            background: "var(--accent-dim)",
            color: "var(--accent)",
            "font-size": "11px",
          }}
        >
          <span style={{ "font-weight": "700" }}>{orderType() === "stop" ? "Стоп ордер:" : "Лимит ордер:"}</span>
          <span>
            отложенный вход временно отключен: приложение пока не может гарантировать установку защитного стопа после исполнения.
            Buy / Sell доступны только при типе Market.
          </span>
        </div>
      </Show>
    </div>
  );
}
