const subscribers = new Map();

export const addSubscriber = (symbol, interval, callback) => {
  if (!subscribers.has(symbol)) {
    subscribers.set(symbol, new Set());
  }
  
  const subscriberId = `${symbol}-${interval}-${Date.now()}-${Math.random()}`;
  const subscriber = { interval, callback, id: subscriberId };
  
  const symbolSubscribers = subscribers.get(symbol);
  symbolSubscribers.add(subscriber);
  
  return subscriberId;
};

export const removeSubscriber = (symbol, subscriberId) => {
  const subs = subscribers.get(symbol);
  if (subs) {
    for (const sub of subs) {
      if (sub.id === subscriberId) {
        subs.delete(sub);
        break;
      }
    }
    
    if (subs.size === 0) {
      subscribers.delete(symbol);
      return true;
    }
  }
  return false;
};

export const getSubscribers = (symbol) => {
  return subscribers.get(symbol);
};

export const hasAnySubscribers = () => {
  return Array.from(subscribers.values()).some(set => set.size > 0);
};

export const getFirstSymbolWithSubscribers = () => {
  const first = Array.from(subscribers.entries()).find(([, set]) => set.size > 0);
  return first ? first[0] : null;
};

