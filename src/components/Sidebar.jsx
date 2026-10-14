import { createSignal, onMount, onCleanup, createMemo, For, Show } from "solid-js";
import { fetchFuturesInstrumentInfo, fetchTicker24hr, fetchTickerPrice, subscribeAllMiniTickers } from "../api/binance";
import { symbol, setSymbol, sidebarOpen, tickers, setTickers, setInstrumentInfo } from "../store/store";
import { formatVolume, formatPrice, formatPercent } from "../utils/format";
import { IconSearch, IconClose } from "./Icons";

export default function Sidebar() {
  const [query, setQuery] = createSignal("");
  const [loaded, setLoaded] = createSignal(false);
  const [order, setOrder] = createSignal([]);
  const [sortKey, setSortKey] = createSignal("volume");
  const [sortDirection, setSortDirection] = createSignal("desc");
  let unsub;
  let pricePoll;

  function changeSort(key) {
    if (sortKey() === key) {
      setSortDirection((direction) => (direction === "desc" ? "asc" : "desc"));
      return;
    }
    setSortKey(key);
    setSortDirection("desc");
  }

  onMount(async () => {
    fetchFuturesInstrumentInfo().then(setInstrumentInfo).catch((err) => {
      console.error("Не удалось получить точность инструментов:", err);
    });

    try {
      const list = await fetchTicker24hr();
      list.sort((a, b) => b.quoteVolume - a.quoteVolume);
      const map = {};
      for (const t of list) map[t.symbol] = t;
      setTickers(map);
      setOrder(list.map((t) => t.symbol));
      setLoaded(true);
    } catch (err) {
      console.error("Не удалось получить список пар:", err);
      setLoaded(true);
    }

    unsub = subscribeAllMiniTickers((batch) => {
      for (const [sym, t] of batch) {
        setTickers(sym, t);
      }
    });

    pricePoll = setInterval(async () => {
      const selectedSymbol = symbol();
      try {
        const price = await fetchTickerPrice(selectedSymbol);
        if (selectedSymbol === symbol()) setTickers(selectedSymbol, "lastPrice", price);
      } catch {
        // Keep the last available price if the polling request fails.
      }
    }, 2000);
  });

  onCleanup(() => {
    unsub?.();
    clearInterval(pricePoll);
  });

  const filtered = createMemo(() => {
    const q = query().trim().toUpperCase();
    const base = order().length ? order() : Object.keys(tickers);
    const matching = q ? base.filter((s) => s.includes(q)) : base;
    const direction = sortDirection() === "desc" ? -1 : 1;
    const key = sortKey();

    return matching
      .map((sym, index) => ({ sym, index, value: key === "volume" ? tickers[sym]?.quoteVolume : tickers[sym]?.priceChangePercent }))
      .sort((a, b) => {
        const aValue = Number.isFinite(a.value) ? a.value : -Infinity;
        const bValue = Number.isFinite(b.value) ? b.value : -Infinity;
        return (aValue - bValue) * direction || a.index - b.index;
      })
      .map(({ sym }) => sym)
      .slice(0, 200);
  });

  const sortIndicator = (key) => (sortKey() === key ? (sortDirection() === "desc" ? " ↓" : " ↑") : "");

  return (
    <div
      style={{
        width: sidebarOpen() ? "268px" : "0px",
        "min-width": sidebarOpen() ? "268px" : "0px",
        overflow: "hidden",
        transition: "width 0.18s ease, min-width 0.18s ease",
        display: "flex",
        "flex-direction": "column",
        background: "var(--bg-panel)",
        "border-left": sidebarOpen() ? "1px solid var(--border-hair)" : "none",
      }}
    >
      <div style={{ width: "268px", display: "flex", "flex-direction": "column", height: "100%" }}>
        <div style={{ padding: "12px 12px 8px", "flex-shrink": 0 }}>
          <div
            style={{
              display: "flex",
              "align-items": "center",
              gap: "6px",
              background: "var(--bg-input)",
              border: "1px solid var(--border-hair)",
              "border-radius": "7px",
              padding: "6px 9px",
            }}
          >
            <IconSearch width="14" height="14" color="var(--text-tertiary)" />
            <input
              value={query()}
              onInput={(e) => setQuery(e.target.value)}
              placeholder="Поиск пары, напр. ETH"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                color: "var(--text-primary)",
                "font-size": "12.5px",
              }}
            />
            <Show when={query()}>
              <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: "var(--text-tertiary)", display: "flex" }}>
                <IconClose width="12" height="12" />
              </button>
            </Show>
          </div>
        </div>

        <div style={{ padding: "0 14px 6px", display: "flex", "font-size": "10.5px", color: "var(--text-tertiary)", "font-weight": "600" }}>
          <span style={{ flex: 1 }}>Инструмент</span>
          <button
            type="button"
            onClick={() => changeSort("volume")}
            title="Сортировать по объёму за 24 часа"
            style={{ width: "70px", padding: "0", border: "none", background: "transparent", color: sortKey() === "volume" ? "var(--text-primary)" : "var(--text-tertiary)", "font-size": "inherit", "font-weight": "inherit", "text-align": "right" }}
          >
            Объём 24ч{sortIndicator("volume")}
          </button>
          <button
            type="button"
            onClick={() => changeSort("change")}
            title="Сортировать по изменению за 24 часа"
            style={{ width: "62px", padding: "0", border: "none", background: "transparent", color: sortKey() === "change" ? "var(--text-primary)" : "var(--text-tertiary)", "font-size": "inherit", "font-weight": "inherit", "text-align": "right" }}
          >
            24ч %{sortIndicator("change")}
          </button>
        </div>

        <div class="thin-scroll" style={{ flex: 1, "overflow-y": "auto", padding: "0 6px 12px" }}>
          <Show when={loaded()} fallback={<div style={{ padding: "20px", color: "var(--text-tertiary)", "font-size": "12px" }}>Загрузка пар…</div>}>
            <For each={filtered()}>
              {(sym) => {
                const t = () => tickers[sym];
                const isActive = () => sym === symbol();
                return (
                  <button
                    onClick={() => setSymbol(sym)}
                    style={{
                      display: "flex",
                      "align-items": "center",
                      width: "100%",
                      padding: "7px 8px",
                      "border-radius": "6px",
                      border: "none",
                      background: isActive() ? "var(--accent-dim)" : "transparent",
                      "text-align": "left",
                      "margin-bottom": "1px",
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        "font-size": "12px",
                        "font-weight": isActive() ? "700" : "500",
                        color: isActive() ? "var(--accent)" : "var(--text-primary)",
                      }}
                    >
                      {sym.replace("USDT", "")}
                      <span style={{ color: "var(--text-tertiary)", "font-weight": "400" }}>/USDT</span>
                    </span>
                    <span class="num" style={{ width: "70px", "text-align": "right", "font-size": "11px", color: "var(--text-secondary)" }}>
                      {t() ? formatVolume(t().quoteVolume) : "—"}
                    </span>
                    <span
                      class="num"
                      classList={{ up: t() && t().priceChangePercent >= 0, down: t() && t().priceChangePercent < 0 }}
                      style={{ width: "62px", "text-align": "right", "font-size": "11px", "font-weight": "600" }}
                    >
                      {t() ? formatPercent(t().priceChangePercent) : "—"}
                    </span>
                  </button>
                );
              }}
            </For>
          </Show>
        </div>
      </div>
    </div>
  );
}
