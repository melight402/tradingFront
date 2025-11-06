import { useCallback } from "react";
import { getCurrentPrice } from "../services/priceDataStorage";
import { roundQuantityToStepSize } from "../utils/tickSizeCache";
import { openPosition } from "../utils/api";

export const useMarketOrderPlacement = () => {
  const placeMarketOrder = useCallback(async (side, symbol, risk, atrValue, ratio) => {
    const entryPrice = getCurrentPrice(symbol);
    
    if (!entryPrice) {
      throw new Error("Текущая цена не найдена. Дождитесь загрузки данных.");
    }

    const ratioNumber = parseFloat(ratio);
    if (isNaN(ratioNumber) || ratioNumber <= 0) {
      throw new Error("Неверное значение Ratio");
    }

    if (!atrValue || atrValue <= 0) {
      throw new Error("ATR должен быть больше 0");
    }

    if (!risk || risk <= 0) {
      throw new Error("Риск должен быть больше 0");
    }

    const isLong = side === "BUY";
    
    const stopPrice = isLong 
      ? entryPrice - atrValue 
      : entryPrice + atrValue;

    const priceDifference = Math.abs(entryPrice - stopPrice);
    
    if (priceDifference === 0) {
      throw new Error("Разница между ценой входа и стоп-лоссом равна нулю");
    }

    let quantity = risk / priceDifference;
    quantity = roundQuantityToStepSize(quantity, symbol);

    if (quantity <= 0) {
      throw new Error("Рассчитанное количество слишком мало. Увеличьте риск или уменьшите ATR.");
    }

    const takeProfitDistance = atrValue * ratioNumber;
    const takeProfit = isLong
      ? entryPrice + takeProfitDistance
      : entryPrice - takeProfitDistance;

    const dateTime = new Date().toISOString();
    const positionSide = isLong ? "LONG" : "SHORT";

    const marketOrderData = {
      dateTime,
      symbol,
      side,
      type: "MARKET",
      price: entryPrice.toString(),
      quantity: quantity.toString(),
      positionSide,
      stopLossPrice: stopPrice.toString(),
      takeProfitPrice: takeProfit.toString(),
      risk: risk.toString(),
    };

    const stopOrderData = {
      dateTime,
      symbol,
      side: isLong ? "SELL" : "BUY",
      type: "STOP_MARKET",
      price: entryPrice.toString(),
      quantity: quantity.toString(),
      positionSide,
      stopPrice: stopPrice.toString(),
      workingType: "CONTRACT_PRICE",
      closePosition: true,
      stopLossPrice: stopPrice.toString(),
      takeProfitPrice: takeProfit.toString(),
      risk: risk.toString(),
    };

    const takeProfitOrderData = {
      dateTime,
      symbol,
      side: isLong ? "SELL" : "BUY",
      type: "TAKE_PROFIT",
      price: takeProfit.toString(),
      quantity: quantity.toString(),
      positionSide,
      stopPrice: takeProfit.toString(),
      timeInForce: "GTC",
      workingType: "CONTRACT_PRICE",
      stopLossPrice: stopPrice.toString(),
      takeProfitPrice: takeProfit.toString(),
      risk: risk.toString(),
    };

    try {
      await openPosition(marketOrderData, null);
    } catch (error) {
      throw error;
    }

    try {
      await openPosition(stopOrderData, null);
    } catch (error) {
      console.error("Ошибка при размещении стоп-лосса:", error);
      throw new Error(`Ордер на открытие позиции размещен, но не удалось разместить стоп-лосс: ${error.message}`);
    }

    try {
      await openPosition(takeProfitOrderData, null);
    } catch (error) {
      console.error("Ошибка при размещении тейк-профита:", error);
      throw new Error(`Ордер на открытие позиции и стоп-лосс размещены, но не удалось разместить тейк-профит: ${error.message}`);
    }
  }, []);

  return { placeMarketOrder };
};

