import { takeScreenshot } from "../utils/screenshot";
import { openPosition } from "../utils/api";
import { calculatePositionQuantity } from "../utils/positionCalculations";
import { roundQuantityToStepSize } from "../utils/tickSizeCache";

export const usePositionOpening = () => {
  const openPositionWithData = async (
    finalEntryPrice,
    finalStopLoss,
    finalTakeProfit,
    finalDirection,
    symbol,
    orderType,
    tvxValue,
    stopPrice,
    risk,
    lastTool
  ) => {
    const riskValue = parseFloat(risk);
    if (!risk || isNaN(riskValue) || riskValue <= 0) {
      alert("Ошибка: Риск должен быть больше нуля. Введите значение риска в USDT.");
      return false;
    }

    const calculatedQuantity = calculatePositionQuantity(
      riskValue,
      finalEntryPrice,
      finalStopLoss
    );

    const roundedQuantity = roundQuantityToStepSize(calculatedQuantity, symbol);

    if (!roundedQuantity || roundedQuantity <= 0) {
      const priceDifference = Math.abs(finalEntryPrice - finalStopLoss);
      alert(`Количество позиции равно нулю (Quantity: 0.00).\n\nПричина: рассчитанное количество ${calculatedQuantity.toFixed(6)} слишком мало для минимального шага размера позиции.\n\nТекущие значения:\n- Риск: ${riskValue} USDT\n- Цена входа: ${finalEntryPrice}\n- Стоп-лосс: ${finalStopLoss}\n- Разница: ${priceDifference.toFixed(2)}\n\nРешение: увеличьте риск или уменьшите разницу между ценой входа и стоп-лоссом.`);
      return false;
    }

    if (!finalTakeProfit) {
      alert("Ошибка: Take Profit должен быть указан в рисунке позиции");
      return false;
    }

    const finalTakeProfitPrice = finalTakeProfit;

    const screenshotBlob = await takeScreenshot();

    const positionSide = finalDirection === "Long" ? "LONG" : "SHORT";
    const side = finalDirection === "Long" ? "BUY" : "SELL";

    const positionData = {
      dateTime: new Date().toISOString(),
      positionSide: positionSide,
      side: side,
      type: orderType || "MARKET",
      tvx: tvxValue || "level_breakout",
      price: finalEntryPrice,
      stopPrice: stopPrice || null,
      quantity: roundedQuantity,
      stopLossPrice: finalStopLoss,
      takeProfitPrice: finalTakeProfitPrice,
      symbol: symbol,
      lineToolId: lastTool ? lastTool.id : null,
      risk: riskValue,
    };
    
    await openPosition(positionData, screenshotBlob);

    localStorage.setItem(`lastOpenPosition_${symbol}`, JSON.stringify(positionData));

    return true;
  };

  return { openPositionWithData };
};

