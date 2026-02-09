import { logError } from "../utils/errorHandler";

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

const STORAGE_SCHEMAS = {
  string: (value) => typeof value === 'string',
  number: (value) => typeof value === 'number' && !isNaN(value) && value >= 0,
  boolean: (value) => typeof value === 'boolean',
  posNumber: (value) => typeof value === 'number' && !isNaN(value) && value > 0,
};

class StorageManager {
  constructor() {
    this.keys = STORAGE_KEYS;
  }

  save(key, value, validate = () => true) {
    try {
      if (!validate(value)) {
        return;
      }
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
    } catch (error) {
      logError("StorageManager.save", error);
    }
  }

  load(key, defaultValue, schema = null) {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return defaultValue;

      if (typeof defaultValue === 'number') {
        const parsed = JSON.parse(value);
        const validate = schema || STORAGE_SCHEMAS.number;
        return validate(parsed) ? parsed : defaultValue;
      }

      if (typeof defaultValue === 'boolean') {
        return JSON.parse(value);
      }

      return value || defaultValue;
    } catch (error) {
      logError("StorageManager.load", error);
      return defaultValue;
    }
  }

  saveSymbol(symbol) {
    this.save(this.keys.SELECTED_SYMBOL, symbol, STORAGE_SCHEMAS.string);
  }

  loadSymbol(defaultValue = 'BTCUSDT') {
    return this.load(this.keys.SELECTED_SYMBOL, defaultValue, STORAGE_SCHEMAS.string);
  }

  saveRisk(risk) {
    this.save(this.keys.RISK_VALUE, risk, STORAGE_SCHEMAS.number);
  }

  loadRisk(defaultValue = 1) {
    return this.load(this.keys.RISK_VALUE, defaultValue, STORAGE_SCHEMAS.number);
  }

  saveOrderType(type) {
    this.save(this.keys.ORDER_TYPE, type, (v) => !v || STORAGE_SCHEMAS.string(v));
  }

  loadOrderType(defaultValue = "MARKET") {
    return this.load(this.keys.ORDER_TYPE, defaultValue, STORAGE_SCHEMAS.string);
  }

  saveTVXValue(value) {
    this.save(this.keys.TVX_VALUE, value, (v) => !v || STORAGE_SCHEMAS.string(v));
  }

  loadTVXValue(defaultValue = "trend_after_pullback") {
    return this.load(this.keys.TVX_VALUE, defaultValue, STORAGE_SCHEMAS.string);
  }

  saveRatio(value) {
    this.save(this.keys.RATIO, value, (v) => !v || STORAGE_SCHEMAS.string(v));
  }

  loadRatio(defaultValue = "2") {
    return this.load(this.keys.RATIO, defaultValue, STORAGE_SCHEMAS.string);
  }

  saveATRValue(value) {
    this.save(this.keys.ATR_VALUE, value, (v) => !v || STORAGE_SCHEMAS.posNumber(v));
  }

  loadATRValue(defaultValue = 1) {
    return this.load(this.keys.ATR_VALUE, defaultValue, STORAGE_SCHEMAS.posNumber);
  }

  saveBottomChartsCollapsed(collapsed) {
    this.save(this.keys.BOTTOM_CHARTS_COLLAPSED, collapsed, STORAGE_SCHEMAS.boolean);
  }

  loadBottomChartsCollapsed(defaultValue = false) {
    return this.load(this.keys.BOTTOM_CHARTS_COLLAPSED, defaultValue, STORAGE_SCHEMAS.boolean);
  }

  saveTopChartTimeframe(timeframe) {
    this.save(this.keys.TOP_CHART_TIMEFRAME, timeframe, (v) => !v || STORAGE_SCHEMAS.string(v));
  }

  loadTopChartTimeframe(defaultValue = '5m') {
    return this.load(this.keys.TOP_CHART_TIMEFRAME, defaultValue, STORAGE_SCHEMAS.string);
  }

  clear(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logError("StorageManager.clear", error);
    }
  }

  clearAll() {
    try {
      Object.values(this.keys).forEach(key => localStorage.removeItem(key));
    } catch (error) {
      logError("StorageManager.clearAll", error);
    }
  }
}

export const storageManager = new StorageManager();
