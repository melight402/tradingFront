import { useCallback } from "react";
import { getCurrentPrice } from "../services/priceDataStorage";
import { roundQuantityToStepSize, roundPriceToTickSize, getTickSizeFromSymbol } from "../utils/tickSizeCache";
import { openPosition } from "../utils/api";

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

    const mainOrderData = {
      dateTime,
      symbol,
      side,
      type: isLimitOrder ? "LIMIT" : "MARKET",
      price: roundedEntryPrice.toString(),
      quantity: quantity.toString(),
      positionSide,
      timeInForce: isLimitOrder ? "GTC" : undefined,
      stopLossPrice: stopLossPrice.toString(),
      takeProfitPrice: takeProfit.toString(),
      risk: risk.toString(),
    };

    if (isLimitOrder) {
      const stopLimitActivationPrice = isLong 
        ? await roundPriceToTickSize(stopLossPrice * 0.99, symbol)
        : await roundPriceToTickSize(stopLossPrice * 1.01, symbol);
      
      const stopLimitExecutionPrice = isLong
        ? await roundPriceToTickSize(stopLimitActivationPrice * 0.998, symbol)
        : await roundPriceToTickSize(stopLimitActivationPrice * 1.002, symbol);
      
      const takeProfitLimitActivationPrice = isLong
        ? await roundPriceToTickSize(takeProfit * 1.01, symbol)
        : await roundPriceToTickSize(takeProfit * 0.99, symbol);
      
      const takeProfitLimitExecutionPrice = isLong
        ? await roundPriceToTickSize(takeProfitLimitActivationPrice * 0.998, symbol)
        : await roundPriceToTickSize(takeProfitLimitActivationPrice * 1.002, symbol);

      const stopLimitOrderData = {
        dateTime,
        symbol,
        side: isLong ? "SELL" : "BUY",
        type: "STOP",
        price: stopLimitExecutionPrice.toString(),
        quantity: quantity.toString(),
        positionSide,
        stopPrice: stopLimitActivationPrice.toString(),
        timeInForce: "GTC",
        workingType: "CONTRACT_PRICE",
        stopLossPrice: stopLossPrice.toString(),
        takeProfitPrice: takeProfit.toString(),
        risk: risk.toString(),
      };

      const stopMarketOrderData = {
        dateTime,
        symbol,
        side: isLong ? "SELL" : "BUY",
        type: "STOP_MARKET",
        price: entryPrice.toString(),
        quantity: quantity.toString(),
        positionSide,
        stopPrice: stopLossPrice.toString(),
        workingType: "CONTRACT_PRICE",
        closePosition: true,
        stopLossPrice: stopLossPrice.toString(),
        takeProfitPrice: takeProfit.toString(),
        risk: risk.toString(),
      };

      const takeProfitLimitOrderData = {
        dateTime,
        symbol,
        side: isLong ? "SELL" : "BUY",
        type: "TAKE_PROFIT",
        price: takeProfitLimitExecutionPrice.toString(),
        quantity: quantity.toString(),
        positionSide,
        stopPrice: takeProfitLimitActivationPrice.toString(),
        timeInForce: "GTC",
        workingType: "CONTRACT_PRICE",
        stopLossPrice: stopLossPrice.toString(),
        takeProfitPrice: takeProfit.toString(),
        risk: risk.toString(),
      };

      const takeProfitMarketOrderData = {
        dateTime,
        symbol,
        side: isLong ? "SELL" : "BUY",
        type: "TAKE_PROFIT_MARKET",
        quantity: quantity.toString(),
        positionSide,
        stopPrice: takeProfit.toString(),
        workingType: "CONTRACT_PRICE",
        closePosition: true,
        stopLossPrice: stopLossPrice.toString(),
        takeProfitPrice: takeProfit.toString(),
        risk: risk.toString(),
      };

      await openPosition(mainOrderData, null);

      try {
        await openPosition(stopLimitOrderData, null);
      } catch (err) {
        throw new Error(`Ордер на открытие позиции размещен, но не удалось разместить лимитный стоп-лосс: ${err.message}`);
      }

      try {
        await openPosition(takeProfitLimitOrderData, null);
      } catch (err) {
        throw new Error(`Ордер на открытие позиции и лимитный стоп-лосс размещены, но не удалось разместить лимитный тейк-профит: ${err.message}`);
      }

      try {
        await openPosition(stopMarketOrderData, null);
      } catch (err) {
        throw new Error(`Ордер на открытие позиции, лимитный стоп-лосс и лимитный тейк-профит размещены, но не удалось разместить рыночный стоп-лосс: ${err.message}`);
      }

      try {
        await openPosition(takeProfitMarketOrderData, null);
      } catch (err) {
        throw new Error(`Ордер на открытие позиции, лимитные и рыночный стоп-лосс размещены, но не удалось разместить рыночный тейк-профит: ${err.message}`);
      }
    } else {
      const stopOrderData = {
        dateTime,
        symbol,
        side: isLong ? "SELL" : "BUY",
        type: "STOP_MARKET",
        price: entryPrice.toString(),
        quantity: quantity.toString(),
        positionSide,
        stopPrice: stopLossPrice.toString(),
        workingType: "CONTRACT_PRICE",
        closePosition: true,
        stopLossPrice: stopLossPrice.toString(),
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
        stopLossPrice: stopLossPrice.toString(),
        takeProfitPrice: takeProfit.toString(),
        risk: risk.toString(),
      };

      await openPosition(mainOrderData, null);

      try {
        await openPosition(stopOrderData, null);
      } catch (err) {
        throw new Error(`Ордер на открытие позиции размещен, но не удалось разместить стоп-лосс: ${err.message}`);
      }

      try {
        await openPosition(takeProfitOrderData, null);
      } catch (err) {
        throw new Error(`Ордер на открытие позиции и стоп-лосс размещены, но не удалось разместить тейк-профит: ${err.message}`);
      }
    }
  }, []);

  return { placeMarketOrder };
};

