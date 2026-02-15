import { takeScreenshot } from "../utils/screenshot";
import { openPositionWithOrders } from "../utils/api";
import { calculatePositionQuantity } from "../utils/positionCalculations";
import { roundQuantityToStepSize } from "../utils/tickSizeCache";
import { useUnfavorablePriceCheck } from "./useUnfavorablePriceCheck";
import { useOrderConfirmationModal } from "./useOrderConfirmationModal";

export const usePositionOpening = () => {
  const { checkUnfavorablePrice } = useUnfavorablePriceCheck();
  const { isOpen, confirmationData, showConfirmation, handleConfirm, handleCancel } = useOrderConfirmationModal();

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
    lastTool,
    timeframe
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
    const positionSide = finalDirection === "Long" ? "LONG" : "SHORT";
    const side = finalDirection === "Long" ? "BUY" : "SELL";

    const priceCheck = checkUnfavorablePrice(
      orderType || "MARKET",
      side,
      finalEntryPrice,
      stopPrice,
      symbol
    );

    if (priceCheck.isUnfavorable) {
      const confirmed = await showConfirmation({
        reason: priceCheck.reason,
        orderPrice: priceCheck.orderPrice,
        marketPrice: priceCheck.marketPrice
      });

      if (!confirmed) {
        return false;
      }
    }

    const screenshotBlob = await takeScreenshot();
    const dateTime = new Date().toISOString();
    const positionUsdt = Math.round((finalEntryPrice * roundedQuantity) * 100) / 100;

    // Данные для ордера открытия позиции
    const entryOrderData = {
      dateTime,
      symbol,
      side,
      type: orderType || "MARKET",
      timeframe: timeframe || 'unknown',
      price: finalEntryPrice.toString(),
      quantity: roundedQuantity.toString(),
      positionSide,
    };

    // Данные для стоп-лосса
    const stopLossOrderData = {
      dateTime,
      symbol,
      side: positionSide === "LONG" ? "SELL" : "BUY",
      type: "STOP_MARKET",
      timeframe: timeframe || 'unknown',
      stopPrice: finalStopLoss.toString(),
      workingType: "CONTRACT_PRICE",
      closePosition: true,
    };

    // Данные для тейк-профита
    const takeProfitOrderData = {
      dateTime,
      symbol,
      side: positionSide === "LONG" ? "SELL" : "BUY",
      type: "TAKE_PROFIT_MARKET",
      timeframe: timeframe || 'unknown',
      stopPrice: finalTakeProfitPrice.toString(),
      workingType: "CONTRACT_PRICE",
      closePosition: true,
    };

    // Комбинированный заказ со всеми необходимыми данными
    const compoundOrderData = {
      dateTime,
      symbol,
      positionSide,
      price: finalEntryPrice.toString(),
      risk: riskValue.toString(),
      tvx: tvxValue || "level_breakout",
      stopPrice: stopPrice || null,
      stopLossPrice: finalStopLoss.toString(),
      takeProfitPrice: finalTakeProfitPrice.toString(),
      quantity: roundedQuantity.toString(),
      positionUsdt: positionUsdt.toString(),
      lineToolId: lastTool ? lastTool.id : null,
      
      entry: entryOrderData,
      stopLoss: stopLossOrderData,
      takeProfit: takeProfitOrderData,
    };
    
    try {
      // Отправляем ВСЕ ордеры в ОДНОМ запросе
      await openPositionWithOrders(compoundOrderData, screenshotBlob);
      
      // Сохраняем историю открытой позиции
      const positionData = {
        dateTime,
        positionSide,
        side,
        type: orderType || "MARKET",
        tvx: tvxValue || "level_breakout",
        timeframe: timeframe || 'unknown',
        price: finalEntryPrice,
        stopPrice: stopPrice || null,
        quantity: roundedQuantity,
        positionUsdt,
        stopLossPrice: finalStopLoss,
        takeProfitPrice: finalTakeProfitPrice,
        symbol,
        lineToolId: lastTool ? lastTool.id : null,
        risk: riskValue,
      };
      
      localStorage.setItem(`lastOpenPosition_${symbol}`, JSON.stringify(positionData));
      return true;
    } catch (err) {
      alert(`Ошибка при открытии позиции: ${err.message}`);
      return false;
    }
  };

  return { 
    openPositionWithData,
    confirmationModal: {
      isOpen,
      confirmationData,
      handleConfirm,
      handleCancel
    }
  };
};

