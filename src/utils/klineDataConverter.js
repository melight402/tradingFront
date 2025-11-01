export const convertKlineData = (klineData) => {
  if (!Array.isArray(klineData)) {
    return [];
  }

  return klineData
    .map((kline) => {
      if (!Array.isArray(kline) || kline.length < 6) {
        return null;
      }
      const date = new Date(kline[0]);
      const open = parseFloat(kline[1]);
      const high = parseFloat(kline[2]);
      const low = parseFloat(kline[3]);
      const close = parseFloat(kline[4]);
      const volume = parseFloat(kline[5]);

      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return null;
      }

      if (!isFinite(open) || isNaN(open) || open <= 0 ||
          !isFinite(high) || isNaN(high) || high <= 0 ||
          !isFinite(low) || isNaN(low) || low <= 0 ||
          !isFinite(close) || isNaN(close) || close <= 0) {
        return null;
      }

      if (high < low || !isFinite(volume) || isNaN(volume) || volume < 0) {
        return null;
      }

      return {
        date: date,
        open: open,
        high: high,
        low: low,
        close: close,
        volume: volume,
      };
    })
    .filter(d => d !== null);
};

