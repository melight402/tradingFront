import { ceilToStep, floorToStep } from "./precision.js";

// Вся арифметика инструмента "риск-бокс": размер позиции считается не от
// капитала и плеча, а от суммы, которой готовы рискнуть (в USDT), растянутой
// между ценой входа и ценой стоп-лосса.
//
//   distancePct = |entry - stop| / entry
//   positionUSDT = riskUSDT / distancePct = riskUSDT * entry / |entry - stop|
//
// Чем ближе стоп к цене входа, тем больше номинал позиции при том же риске.

export function positionSizeUSDT(riskUsdt, entry, stop, quantityStep) {
  const dist = Math.abs(entry - stop);
  if (!dist || !entry) return 0;
  if (quantityStep) return positionQty(riskUsdt, entry, stop, quantityStep) * entry;
  return (riskUsdt * entry) / dist;
}

export function positionQty(riskUsdt, entry, stop, quantityStep) {
  const dist = Math.abs(entry - stop);
  if (!dist) return 0;
  const quantity = riskUsdt / dist;
  return quantityStep ? floorToStep(quantity, quantityStep) : quantity;
}

export function rrRatio(entry, stop, target) {
  const riskDist = Math.abs(entry - stop);
  const rewardDist = Math.abs(target - entry);
  if (!riskDist) return 0;
  return rewardDist / riskDist;
}

export function requiredMarginUSDT(positionUsdt, leverage) {
  if (!leverage) return positionUsdt;
  return positionUsdt / leverage;
}

// ---------------------------------------------------------------------------
// Стоп-ордер (Binance STOP_MARKET) — вход исполняется, когда цена ДОСТИГАЕТ
// уровня входа и продолжает движение в ту же сторону: long триггерится выше
// текущей рыночной цены (пробой вверх), short — ниже (пробой вниз). Если
// отправить в Binance стоп-ордер с "неправильной" стороны, биржа отклонит его
// ошибкой -2021 "Order would immediately trigger.". Эти функции проверяют и
// при необходимости поправляют цену входа под то же самое ограничение.

export function isValidStopEntry(isLong, entry, marketPrice) {
  if (marketPrice == null || !Number.isFinite(marketPrice)) return true; // нет рыночной цены — не блокируем
  return isLong ? entry > marketPrice : entry < marketPrice;
}

export function clampStopEntry(isLong, entry, marketPrice, tickSize) {
  if (isValidStopEntry(isLong, entry, marketPrice)) return entry;
  const eps = marketPrice * 0.0008; // небольшой отступ, чтобы уровень точно был "по ту сторону" рынка
  const adjusted = isLong ? marketPrice + eps : marketPrice - eps;
  if (!tickSize) return adjusted;
  return isLong ? ceilToStep(adjusted, tickSize) : floorToStep(adjusted, tickSize);
}
