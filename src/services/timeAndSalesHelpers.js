const getIntervalMs = (interval) => {
  if (interval.endsWith('m')) {
    const minutes = parseInt(interval);
    return minutes * 60 * 1000;
  }
  if (interval.endsWith('h')) {
    const hours = parseInt(interval);
    return hours * 60 * 60 * 1000;
  }
  if (interval.endsWith('d')) {
    const days = parseInt(interval);
    return days * 24 * 60 * 60 * 1000;
  }
  if (interval.endsWith('w')) {
    const weeks = parseInt(interval);
    return weeks * 7 * 24 * 60 * 60 * 1000;
  }
  if (interval.endsWith('M')) {
    const months = parseInt(interval);
    return months * 30 * 24 * 60 * 60 * 1000;
  }
  return 0;
};

const calculateBuySellSums = (aggTrades) => {
  let buySum = 0;
  let sellSum = 0;

  if (!Array.isArray(aggTrades) || aggTrades.length === 0) {
    return { buySum, sellSum };
  }

  aggTrades.forEach((trade) => {
    const price = parseFloat(trade.p);
    const quantity = parseFloat(trade.q);
    const isBuyerMaker = trade.m === true;

    if (!isFinite(price) || !isFinite(quantity) || price <= 0 || quantity <= 0) {
      return;
    }

    const tradeValue = price * quantity;

    if (isBuyerMaker) {
      sellSum += tradeValue;
    } else {
      buySum += tradeValue;
    }
  });

  return { buySum, sellSum };
};

const fetchAllAggTrades = async (symbol, startTime, endTime) => {
  const allTrades = [];
  let fromId = null;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    let url = `https://fapi.binance.com/fapi/v1/aggTrades?symbol=${symbol}&startTime=${startTime}&endTime=${endTime}&limit=${limit}`;
    
    if (fromId !== null) {
      url += `&fromId=${fromId}`;
    }

    try {
      const trades = await fetchWithRetry(url, 3, 1000);

      if (!Array.isArray(trades) || trades.length === 0) {
        hasMore = false;
        break;
      }

      const validTrades = trades.filter(trade => {
        const tradeTime = trade.T;
        return tradeTime >= startTime && tradeTime < endTime;
      });

      if (validTrades.length === 0) {
        hasMore = false;
        break;
      }

      allTrades.push(...validTrades);

      if (trades.length < limit) {
        hasMore = false;
        break;
      }

      const lastTrade = trades[trades.length - 1];
      const nextFromId = lastTrade.a + 1;

      if (lastTrade.T >= endTime) {
        hasMore = false;
        break;
      }

      fromId = nextFromId;
    } catch {
      hasMore = false;
      break;
    }
  }

  return allTrades;
};

const fetchWithRetry = async (url, maxRetries = 3, retryDelay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      if (err.name === 'AbortError' || attempt === maxRetries - 1) {
        throw err;
      }
      
      if (err instanceof TypeError && (
        err.message.includes('Failed to fetch') ||
        err.message.includes('network') ||
        err.message.includes('connection')
      )) {
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw err;
    }
  }
};

export { getIntervalMs, calculateBuySellSums, fetchWithRetry, fetchAllAggTrades };

