export const calculateMA = (data, period) => {
  if (!data || !Array.isArray(data) || data.length < period) {
    return [];
  }

  const maData = [];
  
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close;
    }
    const ma = sum / period;
    maData.push({
      time: data[i].time,
      value: ma
    });
  }

  return maData;
};

