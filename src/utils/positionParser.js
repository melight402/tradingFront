export const parseTextValues = (text) => {
  const result = { usdt: null, coins: null };
  if (!text) return result;

  const usdtPatterns = [
    /USDT[:\s]*([\d.,]+)/i,
    /([\d.,]+)\s*USDT/i,
    /\$([\d.,]+)/i,
  ];

  for (const pattern of usdtPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1].replace(/,/g, ""));
      if (!isNaN(value)) {
        result.usdt = value;
        break;
      }
    }
  }

  const coinsPatterns = [
    /Coins?[:\s]*([\d.,]+)/i,
    /([\d.,]+)\s*Coins?/i,
    /Количество[:\s]*([\d.,]+)/i,
  ];

  for (const pattern of coinsPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1].replace(/,/g, ""));
      if (!isNaN(value)) {
        result.coins = value;
        break;
      }
    }
  }

  return result;
};
