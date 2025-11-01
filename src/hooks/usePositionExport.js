import { getLastPositionTool } from "../utils/positionToolsExtractor";
import { extractPositionData } from "../utils/positionDataExtractor";
import { getFinalPositionValues } from "../utils/finalPositionValues";
import { calculateEntryPtCoins, calculateEntryPtUSDT } from "../utils/positionCalculations";

export const usePositionExport = (
  chart5mRef,
  chart1hRef,
  chart1dRef,
  symbol,
  openClose,
  orderType,
  tvxValue,
  risk,
  stopPrice,
  purchasePrice,
  manualStopLoss
) => {

  const exportPosition = async () => {
    const lastTool = getLastPositionTool(chart5mRef, chart1hRef, chart1dRef);
    const finalValues = getFinalPositionValues(lastTool, purchasePrice, manualStopLoss);

    if (!finalValues) {
      alert("Нет позиций для экспорта. Убедитесь, что на графиках созданы инструменты 'Длинная/короткая позиция' или заполните поля вручную");
      return;
    }

    if (!finalValues.entryPrice || !finalValues.stopLoss) {
      alert("Для создания позиции вручную необходимо заполнить цену покупки и стоп лосс");
      return;
    }

    const positions = extractPositionData(chart5mRef, chart1hRef, chart1dRef, symbol, risk);
    
    if (!lastTool && finalValues.entryPrice && finalValues.stopLoss) {
      const riskValue = parseFloat(risk) || 0;
      const entryPtCoinsValue = calculateEntryPtCoins(riskValue, finalValues.entryPrice, finalValues.stopLoss, finalValues.direction);
      const entryPtUSDTValue = calculateEntryPtUSDT(finalValues.entryPrice, entryPtCoinsValue);

      const manualPosition = {
        id: `manual_${Date.now()}`,
        interval: "5m",
        symbol: symbol,
        direction: finalValues.direction,
        entryPrice: finalValues.entryPrice,
        stopLoss: finalValues.stopLoss,
        takeProfit: finalValues.takeProfit,
        entryPtUSDT: entryPtUSDTValue,
        entryPtCoins: entryPtCoinsValue,
      };

      if (positions.length === 0) {
        positions.push(manualPosition);
      } else {
        positions[0] = { ...positions[0], ...manualPosition };
      }
    }

    if (positions.length === 0) {
      alert("Нет позиций для экспорта");
      return;
    }

    return { positions, finalValues, lastTool };
  };

  return { exportPosition };
};
