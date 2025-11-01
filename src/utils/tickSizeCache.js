import { BINANCE_FUTURES_STEP_SIZES } from '../constants/binanceStepSizes.js';

const tickSizeCache = new Map();
const symbolInfoCache = new Map();

const getSymbolInfo = async (symbol) => {
  if (symbolInfoCache.has(symbol)) {
    return symbolInfoCache.get(symbol);
  }

  try {
    const response = await fetch(`https://fapi.binance.com/fapi/v1/exchangeInfo?symbol=${symbol}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const exchangeInfo = await response.json();
    const symbolInfo = exchangeInfo.symbols?.find(s => s.symbol === symbol);
    
    if (!symbolInfo) {
      return null;
    }

    symbolInfoCache.set(symbol, symbolInfo);
    return symbolInfo;
  } catch (error) {
    return null;
  }
};

const getTickSizeFromSymbol = async (symbol) => {
  if (tickSizeCache.has(symbol)) {
    return tickSizeCache.get(symbol);
  }

  const symbolInfo = await getSymbolInfo(symbol);
  if (!symbolInfo) {
    return null;
  }

  const priceFilter = symbolInfo.filters?.find(f => f.filterType === 'PRICE_FILTER');
  if (!priceFilter || !priceFilter.tickSize) {
    return null;
  }

  const tickSize = parseFloat(priceFilter.tickSize);
  if (isNaN(tickSize) || tickSize <= 0) {
    return null;
  }

  tickSizeCache.set(symbol, tickSize);
  return tickSize;
};

export const getStepSizeString = (symbol) => {
  return BINANCE_FUTURES_STEP_SIZES[symbol] || null;
};

export const getStepSizeFromSymbol = (symbol) => {
  const stepSizeString = getStepSizeString(symbol);
  if (!stepSizeString) {
    return null;
  }

  const stepSize = parseFloat(stepSizeString);
  if (isNaN(stepSize) || stepSize <= 0) {
    return null;
  }

  return stepSize;
};

export const getPriceFormatFromTickSize = (tickSize) => {
  if (!tickSize || tickSize <= 0) {
    return { precision: 2, minMove: 0.01 };
  }

  if (tickSize >= 1) {
    return { precision: 0, minMove: 1 };
  } else if (tickSize >= 0.1) {
    return { precision: 1, minMove: 0.1 };
  } else if (tickSize >= 0.01) {
    return { precision: 2, minMove: 0.01 };
  } else if (tickSize >= 0.001) {
    return { precision: 3, minMove: 0.001 };
  } else if (tickSize >= 0.0001) {
    return { precision: 4, minMove: 0.0001 };
  } else if (tickSize >= 0.00001) {
    return { precision: 5, minMove: 0.00001 };
  } else if (tickSize >= 0.000001) {
    return { precision: 6, minMove: 0.000001 };
  } else {
    return { precision: 7, minMove: 0.0000001 };
  }
};

export const roundQuantityToStepSize = (quantity, symbol) => {
  if (!quantity || quantity <= 0) {
    return quantity || 0;
  }

  const stepSizeString = getStepSizeString(symbol);
  if (!stepSizeString) {
    return quantity;
  }

  const stepSize = parseFloat(stepSizeString);
  if (isNaN(stepSize) || stepSize <= 0) {
    return quantity;
  }

  let precision = 0;
  if (stepSizeString.includes('.')) {
    const parts = stepSizeString.split('.');
    if (parts.length === 2) {
      precision = parts[1].length;
    }
  }

  const steps = Math.floor(quantity / stepSize);
  
  if (precision > 0) {
    const rounded = steps * stepSize;
    const fixed = Number(rounded.toFixed(precision));
    return fixed;
  }
  
  return Math.round(steps * stepSize);
};

export { getTickSizeFromSymbol };

