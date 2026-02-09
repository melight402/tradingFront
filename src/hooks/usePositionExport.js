import { getLastPositionTool, extractPositionData } from "../services/chartToolsService";
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
    const refs = { chart5mRef, chart1hRef, chart1dRef };
    const lastTool = getLastPositionTool(refs);
    const finalValues = getFinalPositionValues(lastTool);

    if (!finalValues) {
      alert("Нет позиций для экспорта. Убедитесь, что на графиках созданы инструменты 'Длинная/короткая позиция'");
      return;
    }

    if (!finalValues.entryPrice || !finalValues.stopLoss) {
      alert("Нет позиций для экспорта");
      return;
    }

    const positions = extractPositionData(refs, symbol, risk);

    if (positions.length === 0) {
      alert("Нет позиций для экспорта");
      return;
    }

    return { positions, finalValues, lastTool };
  };

  return { exportPosition };
};
