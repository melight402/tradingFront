import { getLastPositionTool } from "../utils/positionToolsExtractor";
import { extractPositionData } from "../utils/positionDataExtractor";
import { getFinalPositionValues } from "../utils/finalPositionValues";

export const usePositionExport = (
  chart5mRef,
  chart1hRef,
  chart1dRef,
  symbol,
  orderType,
  tvxValue,
  risk
) => {

  const exportPosition = async () => {
    const lastTool = getLastPositionTool(chart5mRef, chart1hRef, chart1dRef);
    const finalValues = getFinalPositionValues(lastTool);

    if (!finalValues) {
      alert("Нет позиций для экспорта. Убедитесь, что на графиках созданы инструменты 'Длинная/короткая позиция'");
      return;
    }

    if (!finalValues.entryPrice || !finalValues.stopLoss) {
      alert("Нет позиций для экспорта");
      return;
    }

    const positions = extractPositionData(chart5mRef, chart1hRef, chart1dRef, symbol, risk);

    if (positions.length === 0) {
      alert("Нет позиций для экспорта");
      return;
    }

    return { positions, finalValues, lastTool };
  };

  return { exportPosition };
};
