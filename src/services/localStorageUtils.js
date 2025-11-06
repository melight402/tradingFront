const STORAGE_KEYS = {
  SELECTED_SYMBOL: 'tradingFront_selectedSymbol',
  RISK_VALUE: 'tradingFront_riskValue',
  BUY_SELL: 'tradingFront_buySell',
  ORDER_TYPE: 'tradingFront_orderType',
  TVX_VALUE: 'tradingFront_tvxValue',
  TAKE_PROFIT: 'tradingFront_takeProfit',
  RATIO: 'tradingFront_ratio',
  ATR_VALUE: 'tradingFront_atrValue',
  BOTTOM_CHARTS_COLLAPSED: 'tradingFront_bottomChartsCollapsed',
  TOP_CHART_TIMEFRAME: 'tradingFront_topChartTimeframe',
};


export const saveSelectedSymbol = (symbol) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_SYMBOL, symbol);
  } catch {
      void 0;
  }
};


export const loadSelectedSymbol = (defaultSymbol = 'BTCUSDT') => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_SYMBOL);
    return saved || defaultSymbol;
  } catch {
      void 0;
    return defaultSymbol;
  }
};



export const saveRisk = (risk) => {
  try {
    localStorage.setItem(STORAGE_KEYS.RISK_VALUE, JSON.stringify(risk));
  } catch {
      void 0;
  }
};


export const loadRisk = (defaultValue = 1) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.RISK_VALUE);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (typeof parsed === 'number' && !isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
    return defaultValue;
  } catch {
      void 0;
    return defaultValue;
  }
};

export const saveBuySell = (value) => {
  try {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.BUY_SELL, value);
    } else {
      localStorage.removeItem(STORAGE_KEYS.BUY_SELL);
    }
  } catch {
      void 0;
  }
};

export const loadBuySell = (defaultValue = "BUY") => {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.BUY_SELL);
    if (value === "buy") return "BUY";
    if (value === "sell") return "SELL";
    return value || defaultValue;
  } catch {
      void 0;
    return defaultValue;
  }
};

export const saveOrderType = (value) => {
  try {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.ORDER_TYPE, value);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ORDER_TYPE);
    }
  } catch {
      void 0;
  }
};

export const loadOrderType = (defaultValue = "MARKET") => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ORDER_TYPE) || defaultValue;
  } catch {
      void 0;
    return defaultValue;
  }
};

export const saveTVXValue = (value) => {
  try {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.TVX_VALUE, value);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TVX_VALUE);
    }
  } catch {
      void 0;
  }
};

export const loadTVXValue = (defaultValue = "trend_after_pullback") => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TVX_VALUE) || defaultValue;
  } catch {
      void 0;
    return defaultValue;
  }
};

export const saveTakeProfit = (value) => {
  try {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.TAKE_PROFIT, value);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TAKE_PROFIT);
    }
  } catch {
      void 0;
  }
};

export const loadTakeProfit = (defaultValue = "3") => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TAKE_PROFIT) || defaultValue;
  } catch {
      void 0;
    return defaultValue;
  }
};

export const saveBottomChartsCollapsed = (collapsed) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOTTOM_CHARTS_COLLAPSED, JSON.stringify(collapsed));
  } catch {
      void 0;
  }
};

export const loadBottomChartsCollapsed = (defaultValue = false) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.BOTTOM_CHARTS_COLLAPSED);
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return defaultValue;
  } catch {
      void 0;
    return defaultValue;
  }
};

export const saveTopChartTimeframe = (timeframe) => {
  try {
    if (timeframe) {
      localStorage.setItem(STORAGE_KEYS.TOP_CHART_TIMEFRAME, timeframe);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOP_CHART_TIMEFRAME);
    }
  } catch {
      void 0;
  }
};

export const loadTopChartTimeframe = (defaultValue = '5m') => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TOP_CHART_TIMEFRAME) || defaultValue;
  } catch {
      void 0;
    return defaultValue;
  }
};

export const saveRatio = (value) => {
  try {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.RATIO, value);
    } else {
      localStorage.removeItem(STORAGE_KEYS.RATIO);
    }
  } catch {
      void 0;
  }
};

export const loadRatio = (defaultValue = "2") => {
  try {
    return localStorage.getItem(STORAGE_KEYS.RATIO) || defaultValue;
  } catch {
      void 0;
    return defaultValue;
  }
};

export const saveATRValue = (value) => {
  try {
    if (value !== null && value !== undefined) {
      localStorage.setItem(STORAGE_KEYS.ATR_VALUE, JSON.stringify(value));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ATR_VALUE);
    }
  } catch {
      void 0;
  }
};

export const loadATRValue = (defaultValue = 1) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ATR_VALUE);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (typeof parsed === 'number' && !isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return defaultValue;
  } catch {
      void 0;
    return defaultValue;
  }
};

