export const convertToCandlestickData = (data) => {
  return data
    .filter((d) => d && d.date && typeof d.open === 'number' && typeof d.high === 'number' && typeof d.low === 'number' && typeof d.close === 'number')
    .map((d) => ({
      time: (d.date.getTime() / 1000),
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }))
    .sort((a, b) => a.time - b.time);
};

export const convertToVolumeData = (data) => {
  return data
    .filter((d) => d && d.date && typeof d.volume === 'number')
    .map((d) => ({
      time: (d.date.getTime() / 1000),
      value: d.volume,
      color: d.close >= d.open ? "#26a69a80" : "#ef535080",
    }))
    .sort((a, b) => a.time - b.time);
};
