/**
 * Централизованный сервис для работы с инструментами на графиках
 * Заменяет разрозненные функции из utils/ на единый источник истины
 */

import { safeJSONParse } from '../utils/errorHandler';
import { calculateEntryPtCoins, calculateEntryPtUSDT } from '../utils/positionCalculations';

const SAFE_CHARTS = (refs) => [
  { chart: refs?.chart5m?.current || refs?.chart5mRef?.current, interval: "5m" },
  { chart: refs?.chart1h?.current || refs?.chart1hRef?.current, interval: "1h" },
  { chart: refs?.chart1d?.current || refs?.chart1dRef?.current, interval: "1d" },
].filter(({ chart }) => chart);

const parseTools = (jsonString) => {
  return safeJSONParse(jsonString, [], 'ChartToolsService.parseTools');
};

export const getAllChartTools = (refs, toolType = null) => {
  const allTools = [];
  
  SAFE_CHARTS(refs).forEach(({ chart, interval }) => {
    try {
      const exported = chart.exportLineTools?.();
      if (!exported) return;
      
      const tools = parseTools(exported);
      const filtered = toolType 
        ? tools.filter(t => t.toolType === toolType)
        : tools;
      
      allTools.push(...filtered.map(t => ({ ...t, interval })));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error exporting tools from ${interval}:`, error);
    }
  });
  
  return allTools;
};

export const getLastToolByType = (refs, toolType) => {
  const tools = getAllChartTools(refs, toolType);
  
  return tools.reduce((latest, tool) => {
    const toolTime = tool.points?.length 
      ? Math.max(...tool.points.map(p => p.timestamp || 0))
      : 0;
    
    const latestTime = latest?.points?.length
      ? Math.max(...latest.points.map(p => p.timestamp || 0))
      : 0;
    
    return toolTime > latestTime ? tool : latest;
  }, null);
};

export const getLastPositionTool = (refs) => {
  return getLastToolByType(refs, 'LongShortPosition');
};

export const getLastHorizontalLinePrice = (refs) => {
  const line = getLastToolByType(refs, 'HorizontalLine');
  return line?.points?.[0]?.price || null;
};

export const getAllPositions = (refs) => {
  return getAllChartTools(refs, 'LongShortPosition');
};

export const getPositionToolData = (refs, lineToolId) => {
  const tool = getAllChartTools(refs, 'LongShortPosition').find(
    t => t.id === lineToolId && t.points?.length >= 3
  );
  
  if (!tool) return null;
  
  return {
    stopLossPrice: tool.points[1].price,
    takeProfitPrice: tool.points[2].price,
  };
};

export const extractPositionData = (refs, symbol, risk) => {
  const positions = getAllPositions(refs);
  
  return positions.map((tool) => {
    const points = tool.points;
    if (!points || points.length < 3) return null;
    
    const entryPrice = points[0].price;
    const stopLossPrice = points[1].price;
    const takeProfitPrice = points[2].price;

    const isLong = entryPrice > stopLossPrice;
    const direction = isLong ? "Long" : "Short";
    const riskValue = parseFloat(risk) || 0;
    const entryPtCoinsValue = calculateEntryPtCoins(riskValue, entryPrice, stopLossPrice, direction);
    const entryPtUSDTValue = calculateEntryPtUSDT(entryPrice, entryPtCoinsValue);

    return {
      id: tool.id,
      interval: tool.interval,
      symbol: symbol,
      direction: direction,
      entryPrice,
      stopLossPrice,
      takeProfitPrice,
      entryPtCoins: entryPtCoinsValue,
      entryPtUSDT: entryPtUSDTValue,
      riskValue,
    };
  }).filter(Boolean);
};
