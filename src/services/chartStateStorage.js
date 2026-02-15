const STORAGE_KEY_PREFIX = 'tradingFront_chartState_';

const getChartStateKey = (chartKey, symbol, interval) => {
  return `${STORAGE_KEY_PREFIX}${chartKey}_${symbol}_${interval}`;
};

export const saveChartState = (chartKey, symbol, interval, state) => {
  try {
    const key = getChartStateKey(chartKey, symbol, interval);
    if (state && (state.logicalRange || state.timeRange || state.priceScale || state.priceRange)) {
      localStorage.setItem(key, JSON.stringify(state));
    } else {
      localStorage.removeItem(key);
    }
  } catch {
  }
};

export const loadChartState = (chartKey, symbol, interval) => {
  try {
    const key = getChartStateKey(chartKey, symbol, interval);
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  } catch {
    return null;
  }
};

export const clearAllChartStates = () => {
  try {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
  } catch {
  }
};

