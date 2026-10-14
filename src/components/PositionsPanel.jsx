import { For, Show } from "solid-js";
import { positions, closePosition, showToast, instrumentInfo } from "../store/store";
import { formatPrice } from "../utils/format";
import { closeLivePosition } from "../utils/binanceOrder";

export default function PositionsPanel() {
  async function handleClose(position) {
    try {
      await closeLivePosition({ symbol: position.symbol, side: position.side, quantity: position.quantity, stopOrderId: position.stopOrderId });
      closePosition(position.id);
      showToast(`Позиция по ${position.symbol} закрыта по рынку`, "ok");
    } catch (error) {
      showToast(error.message, "warn");
    }
  }

  return (
    <div
      class="thin-scroll"
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        right: 0,
        width: "340px",
        "max-height": "360px",
        "overflow-y": "auto",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-strong)",
        "border-radius": "9px",
        "box-shadow": "0 12px 32px rgba(0,0,0,0.45)",
        "z-index": 40,
        padding: "8px",
      }}
    >
      <Show when={positions.length} fallback={
        <div style={{ padding: "18px 8px", "text-align": "center", color: "var(--text-tertiary)", "font-size": "12px" }}>
          Пока нет позиций. Нарисуйте Long/Short на графике и нажмите «Открыть позицию».
        </div>
      }>
        <For each={positions}>
          {(p) => (
            <div
              style={{
                display: "flex",
                "flex-direction": "column",
                gap: "4px",
                padding: "9px 10px",
                "border-radius": "7px",
                background: "var(--bg-input)",
                "margin-bottom": "6px",
              }}
            >
              <div style={{ display: "flex", "align-items": "center", gap: "6px" }}>
                <span
                  style={{
                    "font-size": "10px",
                    "font-weight": "700",
                    padding: "2px 6px",
                    "border-radius": "4px",
                    background: p.side === "long" ? "var(--long-dim)" : "var(--short-dim)",
                    color: p.side === "long" ? "var(--long)" : "var(--short)",
                  }}
                >
                  {p.side === "long" ? "LONG" : "SHORT"}
                </span>
                <span style={{ "font-weight": "600", "font-size": "12px" }}>{p.symbol}</span>
                <span
                  style={{
                    "margin-left": "auto",
                    "font-size": "10px",
                    color: p.status === "open" ? "var(--long)" : "var(--text-tertiary)",
                  }}
                >
                  {p.status === "open" ? "открыта" : "закрыта"}
                </span>
              </div>
              <div class="num" style={{ "font-size": "11px", color: "var(--text-secondary)", display: "flex", gap: "10px" }}>
                <span>Вход {formatPrice(p.entry, instrumentInfo[p.symbol]?.tickSize)}</span>
                <span>Стоп {formatPrice(p.stop, instrumentInfo[p.symbol]?.tickSize)}</span>
                <span>PT {formatPrice(p.pt, instrumentInfo[p.symbol]?.tickSize)}</span>
              </div>
              <div class="num" style={{ "font-size": "11px", color: "var(--text-primary)" }}>
                Размер {p.sizeUsdt.toFixed(2)} USDT · риск {p.riskUsdt.toFixed(2)} USDT
              </div>
              <Show when={p.note}>
                <div style={{ "font-size": "11px", color: "var(--text-secondary)", "font-style": "italic" }}>
                  «{p.note}»
                </div>
              </Show>
              <Show when={p.status === "open"}>
                <button
                  onClick={() => handleClose(p)}
                  style={{
                    "align-self": "flex-start",
                    "margin-top": "2px",
                    background: "none",
                    border: "1px solid var(--border-strong)",
                    color: "var(--text-secondary)",
                    "border-radius": "5px",
                    padding: "3px 8px",
                    "font-size": "10.5px",
                  }}
                >
                  Закрыть
                </button>
              </Show>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
}
