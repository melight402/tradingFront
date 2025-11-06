const STORAGE_KEYS = {
  SELECTED_SYMBOL: 'tradingFront_selectedSymbol',
  RISK_VALUE: 'tradingFront_riskValue',
  BUY_SELL: 'tradingFront_buySell',
  ORDER_TYPE: 'tradingFront_orderType',
  TVX_VALUE: 'tradingFront_tvxValue',
  TAKE_PROFIT: 'tradingFront_takeProfit',
  BOTTOM_CHARTS_COLLAPSED: 'tradingFront_bottomChartsCollapsed',
};


export const saveSelectedSymbol = (symbol) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_SYMBOL, symbol);
  } catch (error) {
    console.warn('Failed to save selected symbol to localStorage:', error);
  }
};


export const loadSelectedSymbol = (defaultSymbol = 'BTCUSDT') => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_SYMBOL);
    return saved || defaultSymbol;
  } catch (error) {
    console.warn('Failed to load selected symbol from localStorage:', error);
    return defaultSymbol;
  }
};



export const saveRisk = (risk) => {
  try {
    localStorage.setItem(STORAGE_KEYS.RISK_VALUE, JSON.stringify(risk));
  } catch (error) {
    console.warn('Failed to save risk to localStorage:', error);
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
  } catch (error) {
    console.warn('Failed to load risk from localStorage:', error);
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
  } catch (error) {
    console.warn('Failed to save buySell to localStorage:', error);
  }
};

export const loadBuySell = (defaultValue = "BUY") => {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.BUY_SELL);
    if (value === "buy") return "BUY";
    if (value === "sell") return "SELL";
    return value || defaultValue;
  } catch (error) {
    console.warn('Failed to load buySell from localStorage:', error);
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
  } catch (error) {
    console.warn('Failed to save orderType to localStorage:', error);
  }
};

export const loadOrderType = (defaultValue = "MARKET") => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ORDER_TYPE) || defaultValue;
  } catch (error) {
    console.warn('Failed to load orderType from localStorage:', error);
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
  } catch (error) {
    console.warn('Failed to save tvxValue to localStorage:', error);
  }
};

export const loadTVXValue = (defaultValue = "trend_after_pullback") => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TVX_VALUE) || defaultValue;
  } catch (error) {
    console.warn('Failed to load tvxValue from localStorage:', error);
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
  } catch (error) {
    console.warn('Failed to save takeProfit to localStorage:', error);
  }
};

export const loadTakeProfit = (defaultValue = "3") => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TAKE_PROFIT) || defaultValue;
  } catch (error) {
    console.warn('Failed to load takeProfit from localStorage:', error);
    return defaultValue;
  }
};

export const saveBottomChartsCollapsed = (collapsed) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOTTOM_CHARTS_COLLAPSED, JSON.stringify(collapsed));
  } catch (error) {
    console.warn('Failed to save bottom charts collapsed state to localStorage:', error);
  }
};

export const loadBottomChartsCollapsed = (defaultValue = false) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.BOTTOM_CHARTS_COLLAPSED);
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return defaultValue;
  } catch (error) {
    console.warn('Failed to load bottom charts collapsed state from localStorage:', error);
    return defaultValue;
  }
};

