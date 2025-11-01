export const formatVolume = (volume) => {
  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(2)}B`;
  } else if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(2)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)}K`;
  }
  return volume.toFixed(2);
};

export const formatPriceChange = (percent) => {
  const sign = percent >= 0 ? "+" : "";
  return `${sign}${percent.toFixed(2)}%`;
};

export const formatSymbolLabel = (symbol) => {
  if (symbol.endsWith("USDT")) {
    return symbol.replace("USDT", "/USDT");
  }
  if (symbol.endsWith("USDC")) {
    return symbol.replace("USDC", "/USDC");
  }
  return symbol;
};

export const isValidPriceValue = (value) => {
  return typeof value === 'number' && 
         isFinite(value) && 
         !isNaN(value) && 
         value > 0;
};

export const formatPrice = (price) => {
  if (typeof price !== 'number' || !isFinite(price) || isNaN(price)) {
    return '0';
  }
  
  const priceStr = price.toFixed(8);
  const trimmedStr = priceStr.replace(/\.?0+$/, '');
  
  return trimmedStr;
};

export const calculatePriceFormat = (data, tickSize = null) => {
  if (tickSize && tickSize > 0) {
    const minMove = tickSize;
    const minMoveStr = minMove.toString();
    const decimalIndex = minMoveStr.indexOf('.');
    let precision = 2;
    
    if (decimalIndex !== -1) {
      const decimalPart = minMoveStr.substring(decimalIndex + 1);
      const significantDecimals = decimalPart.replace(/0+$/, '').length;
      precision = Math.max(0, significantDecimals);
    } else {
      precision = 0;
    }
    
    return { precision, minMove };
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return { precision: 2, minMove: 0.01 };
  }

  const prices = [];
  data.forEach(d => {
    if (isValidPriceValue(d.open)) prices.push(d.open);
    if (isValidPriceValue(d.high)) prices.push(d.high);
    if (isValidPriceValue(d.low)) prices.push(d.low);
    if (isValidPriceValue(d.close)) prices.push(d.close);
  });

  if (prices.length === 0) {
    return { precision: 2, minMove: 0.01 };
  }

  prices.sort((a, b) => a - b);
  const priceDiffs = [];
  for (let i = 1; i < Math.min(prices.length, 200); i++) {
    const diff = Math.abs(prices[i] - prices[i - 1]);
    if (diff > 0 && isFinite(diff) && diff < prices[i - 1] * 0.1) {
      priceDiffs.push(diff);
    }
  }

  let minMove = 0.01;
  let precision = 2;

  if (priceDiffs.length > 0) {
    priceDiffs.sort((a, b) => a - b);
    const filteredDiffs = priceDiffs.filter(d => d > 0 && d < 1000);
    
    if (filteredDiffs.length > 0) {
      const minDiff = filteredDiffs[0];
      
      let candidateMinMove = minDiff;
      
      if (candidateMinMove >= 1) {
        minMove = 1;
        precision = 0;
      } else if (candidateMinMove >= 0.1) {
        minMove = 0.1;
        precision = 1;
      } else if (candidateMinMove >= 0.01) {
        minMove = 0.01;
        precision = 2;
      } else if (candidateMinMove >= 0.001) {
        minMove = 0.001;
        precision = 3;
      } else if (candidateMinMove >= 0.0001) {
        minMove = 0.0001;
        precision = 4;
      } else if (candidateMinMove >= 0.00001) {
        minMove = 0.00001;
        precision = 5;
      } else if (candidateMinMove >= 0.000001) {
        minMove = 0.000001;
        precision = 6;
      } else {
        minMove = 0.0000001;
        precision = 7;
      }
    }
  }

  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  
  if (avgPrice >= 1000 && precision > 2) {
    minMove = 0.01;
    precision = 2;
  } else if (avgPrice >= 100 && precision > 2) {
    minMove = 0.01;
    precision = 2;
  } else if (avgPrice >= 10 && precision > 2) {
    minMove = 0.01;
    precision = 2;
  } else if (avgPrice >= 1 && precision > 2) {
    minMove = 0.01;
    precision = 2;
  }

  minMove = Math.max(0.0000001, Math.min(1, minMove));
  precision = Math.max(0, Math.min(8, precision));

  return { precision, minMove };
};
