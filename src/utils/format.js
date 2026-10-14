import { decimalPlaces } from "./precision.js";

export function formatVolume(n) {
  if (n == null || Number.isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

export function formatCompact(n) {
  if (n == null || Number.isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(2);
}

// Подбирает разумное число знаков после запятой исходя из величины цены —
// у Binance тиковый размер сильно отличается для BTC ($0.1) и мем-монет ($0.000001).
export function pricePrecision(price, tickSize) {
  if (Number.isFinite(Number(tickSize)) && Number(tickSize) > 0) {
    return decimalPlaces(tickSize);
  }
  if (price >= 1000) return 2;
  if (price >= 100) return 3;
  if (price >= 1) return 4;
  if (price >= 0.01) return 6;
  return 8;
}

export function formatPrice(price, tickSize) {
  if (price == null || Number.isNaN(price)) return "—";
  return price.toFixed(pricePrecision(price, tickSize));
}

export function formatPercent(n) {
  if (n == null || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}
