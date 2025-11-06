import { useCallback } from "react";
import { getCurrentPrice } from "../services/priceDataStorage";
import { roundQuantityToStepSize, roundPriceToTickSize } from "../utils/tickSizeCache";
import { openPosition } from "../utils/api";

export const useMarketOrderPlacement = () => {
  const placeMarketOrder = useCallback(async (side, symbol, risk, atrValue, ratio, orderType = "MARKET") => {
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
    const isLimitOrder = orderType === "LIMIT";

    const roundedEntryPrice = isLimitOrder 
      ? await roundPriceToTickSize(entryPrice, symbol)
      : entryPrice;

    const mainOrderData = {
      dateTime,
      symbol,
      side,
      type: isLimitOrder ? "LIMIT" : "MARKET",
      price: roundedEntryPrice.toString(),
      quantity: quantity.toString(),
      positionSide,
      timeInForce: isLimitOrder ? "GTC" : undefined,
      stopLossPrice: stopPrice.toString(),
      takeProfitPrice: takeProfit.toString(),
      risk: risk.toString(),
    };

    if (isLimitOrder) {
      const stopLimitActivationPrice = isLong 
        ? await roundPriceToTickSize(stopPrice * 1.1, symbol)
        : await roundPriceToTickSize(stopPrice * 0.9, symbol);
      
      const stopLimitExecutionPrice = isLong
        ? await roundPriceToTickSize(stopPrice * 1.05, symbol)
        : await roundPriceToTickSize(stopPrice * 0.95, symbol);
      
      const takeProfitLimitActivationPrice = isLong
        ? await roundPriceToTickSize(takeProfit * 0.9, symbol)
        : await roundPriceToTickSize(takeProfit * 1.1, symbol);
      
      const takeProfitLimitExecutionPrice = isLong
        ? await roundPriceToTickSize(takeProfit * 0.95, symbol)
        : await roundPriceToTickSize(takeProfit * 1.05, symbol);

      const stopLimitOrderData = {
        dateTime,
        symbol,
        side: isLong ? "SELL" : "BUY",
        type: "STOP_LIMIT",
        price: stopLimitExecutionPrice.toString(),
        quantity: quantity.toString(),
        positionSide,
        stopPrice: stopLimitActivationPrice.toString(),
        timeInForce: "GTC",
        workingType: "CONTRACT_PRICE",
        stopLossPrice: stopPrice.toString(),
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
        stopPrice: stopPrice.toString(),
        workingType: "CONTRACT_PRICE",
        closePosition: true,
        stopLossPrice: stopPrice.toString(),
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
        stopLossPrice: stopPrice.toString(),
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
        stopLossPrice: stopPrice.toString(),
        takeProfitPrice: takeProfit.toString(),
        risk: risk.toString(),
      };

      try {
        await openPosition(mainOrderData, null);
      } catch (error) {
        throw error;
      }

      try {
        await openPosition(stopLimitOrderData, null);
      } catch (error) {
        console.error("Ошибка при размещении лимитного стоп-лосса:", error);
        throw new Error(`Ордер на открытие позиции размещен, но не удалось разместить лимитный стоп-лосс: ${error.message}`);
      }

      try {
        await openPosition(takeProfitLimitOrderData, null);
      } catch (error) {
        console.error("Ошибка при размещении лимитного тейк-профита:", error);
        throw new Error(`Ордер на открытие позиции и лимитный стоп-лосс размещены, но не удалось разместить лимитный тейк-профит: ${error.message}`);
      }

      try {
        await openPosition(stopMarketOrderData, null);
      } catch (error) {
        console.error("Ошибка при размещении рыночного стоп-лосса:", error);
        throw new Error(`Ордер на открытие позиции, лимитный стоп-лосс и лимитный тейк-профит размещены, но не удалось разместить рыночный стоп-лосс: ${error.message}`);
      }

      try {
        await openPosition(takeProfitMarketOrderData, null);
      } catch (error) {
        console.error("Ошибка при размещении рыночного тейк-профита:", error);
        throw new Error(`Ордер на открытие позиции, лимитные и рыночный стоп-лосс размещены, но не удалось разместить рыночный тейк-профит: ${error.message}`);
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
        await openPosition(mainOrderData, null);
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
    }
  }, []);

  return { placeMarketOrder };
};

