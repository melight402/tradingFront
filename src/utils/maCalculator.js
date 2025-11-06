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
    
    let time;
    if (data[i].time) {
      time = data[i].time;
    } else if (data[i].date && data[i].date instanceof Date) {
      time = data[i].date.getTime() / 1000;
    } else {
      continue;
    }
    
    if (!isFinite(time) || isNaN(time) || time <= 0) {
      continue;
    }
    
    maData.push({
      time: time,
      value: ma
    });
  }

  return maData;
};

