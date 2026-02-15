import { useCallback } from "react";
import { getCurrentPrice } from "../services/priceDataStorage";
import { roundQuantityToStepSize, roundPriceToTickSize, getTickSizeFromSymbol } from "../utils/tickSizeCache";
import { openPositionWithOrders } from "../utils/api";
import { loadTopChartTimeframe } from "../services/localStorageUtils";

export const useMarketOrderPlacement = () => {
  const placeMarketOrder = useCallback(async (side, symbol, risk, stopLossPrice, ratio, orderType = "MARKET") => {
    const entryPrice = getCurrentPrice(symbol);
    
    if (!entryPrice) {
      throw new Error("Текущая цена не найдена. Дождитесь загрузки данных.");
    }

    const ratioNumber = parseFloat(ratio);
    if (isNaN(ratioNumber) || ratioNumber <= 0) {
      throw new Error("Неверное значение Ratio");
    }

    if (!stopLossPrice || stopLossPrice <= 0) {
      throw new Error("Цена стоп-лосса не найдена. Выставьте горизонтальный уровень на графике.");
    }

    if (!risk || risk <= 0) {
      throw new Error("Риск должен быть больше 0");
    }

    const isLong = side === "BUY";
    
    const priceDifference = Math.abs(entryPrice - stopLossPrice);
    
    if (priceDifference === 0) {
      throw new Error("Разница между ценой входа и стоп-лоссом равна нулю");
    }

    const isValidStopLoss = isLong 
      ? stopLossPrice < entryPrice 
      : stopLossPrice > entryPrice;

    if (!isValidStopLoss) {
      throw new Error(isLong 
        ? "Стоп-лосс для LONG должен быть ниже цены входа" 
        : "Стоп-лосс для SHORT должен быть выше цены входа");
    }

    let quantity = risk / priceDifference;
    quantity = roundQuantityToStepSize(quantity, symbol);

    if (quantity <= 0) {
      throw new Error("Рассчитанное количество слишком мало. Увеличьте риск или измените стоп-лосс.");
    }

    const takeProfitDistance = priceDifference * ratioNumber;
    const takeProfit = isLong
      ? entryPrice + takeProfitDistance
      : entryPrice - takeProfitDistance;

    const dateTime = new Date().toISOString();
    const positionSide = isLong ? "LONG" : "SHORT";
    const isLimitOrder = orderType === "LIMIT";
    const timeframe = loadTopChartTimeframe();

    let roundedEntryPrice = entryPrice;
    if (isLimitOrder) {
      const tickSize = await getTickSizeFromSymbol(symbol);
      if (tickSize && tickSize > 0) {
        const adjustedPrice = isLong 
          ? entryPrice - tickSize
          : entryPrice + tickSize;
        roundedEntryPrice = await roundPriceToTickSize(adjustedPrice, symbol);
      } else {
        roundedEntryPrice = await roundPriceToTickSize(entryPrice, symbol);
      }
    }

    // Основные данные ордера открытия позиции
    const entryOrderData = {
      dateTime,
      symbol,
      side,
      type: isLimitOrder ? "LIMIT" : "MARKET",
      timeframe,
      price: roundedEntryPrice.toString(),
      quantity: quantity.toString(),
      positionSide,
      timeInForce: isLimitOrder ? "GTC" : undefined,
      risk: risk.toString(),
    };

    // Данные для стоп-лосса
    const stopLossOrderData = {
      dateTime,
      symbol,
      side: isLong ? "SELL" : "BUY",
      type: "STOP_MARKET",
      timeframe,
      stopPrice: stopLossPrice.toString(),
      workingType: "CONTRACT_PRICE",
      closePosition: true,
    };

    // Данные для тейк-профита
    const takeProfitOrderData = {
      dateTime,
      symbol,
      side: isLong ? "SELL" : "BUY",
      type: "TAKE_PROFIT_MARKET",
      timeframe,
      stopPrice: takeProfit.toString(),
      workingType: "CONTRACT_PRICE",
      closePosition: true,
    };

    // Комбинированный заказ с метаданными
    const compoundOrderData = {
      dateTime,
      symbol,
      positionSide,
      price: roundedEntryPrice.toString(),
      risk: risk.toString(),
      stopLossPrice: stopLossPrice.toString(),
      takeProfitPrice: takeProfit.toString(),
      
      entry: entryOrderData,
      stopLoss: stopLossOrderData,
      takeProfit: takeProfitOrderData,
    };

    // Отправляем ВСЕ ордеры в ОДНОМ запросе
    await openPositionWithOrders(compoundOrderData, null);
  }, []);

  return { placeMarketOrder };
};

