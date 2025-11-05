import { getCurrentPrice } from "../services/priceUpdateService";

export const useUnfavorablePriceCheck = () => {
  const checkUnfavorablePrice = (orderType, side, price, stopPrice, symbol) => {
    if (orderType === "MARKET") {
      return { isUnfavorable: false };
    }

    const currentPrice = getCurrentPrice(symbol);
    
    if (!currentPrice) {
      return { isUnfavorable: false, reason: "Текущая цена недоступна" };
    }

    const isLong = side === "BUY" || side === "LONG";
    const isShort = side === "SELL" || side === "SHORT";

    if (orderType === "LIMIT" || orderType === "POST_ONLY") {
      if (!price) {
        return { isUnfavorable: false };
      }

      const orderPrice = parseFloat(price);
      const marketPrice = parseFloat(currentPrice);

      if (isLong && orderPrice > marketPrice) {
        return {
          isUnfavorable: true,
          reason: `Лимитная цена покупки (${orderPrice.toFixed(2)}) выше текущей рыночной цены (${marketPrice.toFixed(2)}). Ордер может исполниться немедленно.`,
          orderPrice,
          marketPrice
        };
      }

      if (isShort && orderPrice < marketPrice) {
        return {
          isUnfavorable: true,
          reason: `Лимитная цена продажи (${orderPrice.toFixed(2)}) ниже текущей рыночной цены (${marketPrice.toFixed(2)}). Ордер может исполниться немедленно.`,
          orderPrice,
          marketPrice
        };
      }
    }

    if (orderType === "STOP_MARKET") {
      if (!stopPrice) {
        return { isUnfavorable: false };
      }

      const stop = parseFloat(stopPrice);
      const marketPrice = parseFloat(currentPrice);

      if (isLong && stop < marketPrice) {
        return {
          isUnfavorable: true,
          reason: `Стоп-цена для покупки (${stop.toFixed(2)}) ниже текущей рыночной цены (${marketPrice.toFixed(2)}). Ордер может исполниться немедленно.`,
          orderPrice: stop,
          marketPrice
        };
      }

      if (isShort && stop > marketPrice) {
        return {
          isUnfavorable: true,
          reason: `Стоп-цена для продажи (${stop.toFixed(2)}) выше текущей рыночной цены (${marketPrice.toFixed(2)}). Ордер может исполниться немедленно.`,
          orderPrice: stop,
          marketPrice
        };
      }
    }

    if (orderType === "STOP_LIMIT") {
      if (!stopPrice || !price) {
        return { isUnfavorable: false };
      }

      const stop = parseFloat(stopPrice);
      const limitPrice = parseFloat(price);
      const marketPrice = parseFloat(currentPrice);

      if (isLong && stop < marketPrice && limitPrice > marketPrice) {
        return {
          isUnfavorable: true,
          reason: `Стоп-цена (${stop.toFixed(2)}) ниже текущей рыночной цены (${marketPrice.toFixed(2)}), а лимитная цена (${limitPrice.toFixed(2)}) выше рыночной. Ордер может исполниться немедленно.`,
          orderPrice: limitPrice,
          marketPrice
        };
      }

      if (isShort && stop > marketPrice && limitPrice < marketPrice) {
        return {
          isUnfavorable: true,
          reason: `Стоп-цена (${stop.toFixed(2)}) выше текущей рыночной цены (${marketPrice.toFixed(2)}), а лимитная цена (${limitPrice.toFixed(2)}) ниже рыночной. Ордер может исполниться немедленно.`,
          orderPrice: limitPrice,
          marketPrice
        };
      }
    }

    return { isUnfavorable: false };
  };

  return { checkUnfavorablePrice };
};

