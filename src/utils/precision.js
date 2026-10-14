export function decimalPlaces(value) {
  if (value == null || !Number.isFinite(Number(value))) return 0;
  const text = String(value).toLowerCase();
  const [coefficient, exponentText] = text.split("e");
  const exponent = Number(exponentText || 0);
  const decimalLength = (coefficient.split(".")[1] || "").length;
  return Math.max(0, decimalLength - exponent);
}

export function roundToStep(value, step) {
  const increment = Number(step);
  if (!Number.isFinite(value) || !Number.isFinite(increment) || increment <= 0) return value;
  const precision = decimalPlaces(step);
  const steps = Math.round(value / increment);
  return Number((steps * increment).toFixed(precision));
}

export function floorToStep(value, step) {
  const increment = Number(step);
  if (!Number.isFinite(value) || !Number.isFinite(increment) || increment <= 0) return value;
  const precision = decimalPlaces(step);
  const steps = Math.floor(value / increment + 1e-10);
  return Number((steps * increment).toFixed(precision));
}

export function ceilToStep(value, step) {
  const increment = Number(step);
  if (!Number.isFinite(value) || !Number.isFinite(increment) || increment <= 0) return value;
  const precision = decimalPlaces(step);
  const steps = Math.ceil(value / increment - 1e-10);
  return Number((steps * increment).toFixed(precision));
}