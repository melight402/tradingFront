export const getIntervalMs = (interval) => {
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

export const getCandleTimeRange = (candleDate, interval) => {
  const intervalMs = getIntervalMs(interval);
  const startTime = candleDate.getTime();
  const endTime = startTime + intervalMs;
  return { startTime, endTime };
};

export const calculateCandleStartTime = (timestamp, interval) => {
  const intervalMs = getIntervalMs(interval);
  if (intervalMs === 0) {
    return timestamp;
  }
  
  const date = new Date(timestamp);
  
  if (interval.endsWith('m')) {
    const minutes = parseInt(interval);
    date.setSeconds(0, 0);
    const totalMinutes = Math.floor(date.getMinutes() / minutes) * minutes;
    date.setMinutes(totalMinutes);
    return date.getTime();
  }
  
  if (interval.endsWith('h')) {
    const hours = parseInt(interval);
    date.setMinutes(0, 0, 0);
    const totalHours = Math.floor(date.getHours() / hours) * hours;
    date.setHours(totalHours);
    return date.getTime();
  }
  
  if (interval.endsWith('d')) {
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }
  
  if (interval.endsWith('w')) {
    const day = date.getDay();
    const diff = date.getDate() - day;
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }
  
  if (interval.endsWith('M')) {
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }
  
  return timestamp;
};

