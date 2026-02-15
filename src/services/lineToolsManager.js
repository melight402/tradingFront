const LINE_TOOLS_STORAGE_PREFIX = 'tradingFront_lineTools_';


const getLineToolsStorageKey = (symbol, interval) => {
  return `${LINE_TOOLS_STORAGE_PREFIX}${symbol}_${interval}`;
};


export const saveLineToolsToStorage = (symbol, interval, lineToolsJson) => {
  try {
    const key = getLineToolsStorageKey(symbol, interval);
    if (lineToolsJson && lineToolsJson.trim() !== '' && lineToolsJson !== '[]') {
      localStorage.setItem(key, lineToolsJson);
    } else {
      localStorage.removeItem(key);
    }
  } catch {
  }
};


export const loadLineToolsFromStorage = (symbol, interval) => {
  try {
    const key = getLineToolsStorageKey(symbol, interval);
    const saved = localStorage.getItem(key);
    if (saved && saved.trim() !== '' && saved !== '[]') {
      JSON.parse(saved);
      return saved;
    }
    return null;
  } catch {
    return null;
  }
};


export const removeLineToolsFromStorage = (symbol, interval) => {
  try {
    const key = getLineToolsStorageKey(symbol, interval);
    localStorage.removeItem(key);
  } catch {
  }
};


export const removeAllLineToolsFromStorage = () => {
  try {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith(LINE_TOOLS_STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
  } catch {
  }
};


export const exportLineToolsFromChart = (chart) => {
  if (!chart) return null;
  
  try {
    const exported = chart.exportLineTools();
    if (exported && exported.trim() !== '' && exported !== '[]') {
      JSON.parse(exported);
      return exported;
    }
    return null;
  } catch {
    return null;
  }
};


export const importLineToolsToChart = (chart, lineToolsJson) => {
  if (!chart || !lineToolsJson) return false;
  
  try {
    JSON.parse(lineToolsJson);
    chart.removeAllLineTools();
    chart.importLineTools(lineToolsJson);
    return true;
  } catch {
    return false;
  }
};


export const persistLineToolsFromChart = (chart, symbol, interval) => {
  if (!chart || !symbol || !interval) return;
  
  const exported = exportLineToolsFromChart(chart);
  saveLineToolsToStorage(symbol, interval, exported);
};


export const restoreLineToolsToChart = (chart, symbol, interval) => {
  if (!chart || !symbol || !interval) return false;
  
  const saved = loadLineToolsFromStorage(symbol, interval);
  if (saved) {
    return importLineToolsToChart(chart, saved);
  }
  
  return false;
};

