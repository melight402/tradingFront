export const INTERVALS = [
  { value: "1m", label: "1 минута" },
  { value: "3m", label: "3 минуты" },
  { value: "5m", label: "5 минут" },
  { value: "15m", label: "15 минут" },
  { value: "30m", label: "30 минут" },
  { value: "1h", label: "1 час" },
  { value: "2h", label: "2 часа" },
  { value: "4h", label: "4 часа" },
  { value: "6h", label: "6 часов" },
  { value: "8h", label: "8 часов" },
  { value: "12h", label: "12 часов" },
  { value: "1d", label: "1 день" },
  { value: "3d", label: "3 дня" },
  { value: "1w", label: "1 неделя" },
  { value: "1M", label: "1 месяц" },
];

export const DRAWING_TOOLS = [
  { value: null, label: "Нет инструмента" },
  { value: "LongShortPosition", label: "Длинная/короткая позиция", icon: "📊" },
  { value: "HorizontalLine", label: "Горизонтальная линия", icon: "➖" },
  { value: "TrendLine", label: "Трендовая линия", icon: "📈" },
  { value: "Ray", label: "Луч", icon: "➡️" },
  { value: "Triangle", label: "Треугольник", icon: "🔺" },
  { value: "ParallelChannel", label: "Параллельный канал", icon: "📏" },
  { value: "FibRetracement", label: "Коррекция Фибоначчи", icon: "📐" },
  { value: "Path", label: "ABC", icon: "✏️" },
];

export const DRAWING_TOOLS_WITHOUT_NONE = DRAWING_TOOLS.filter(tool => tool.value !== null);

export const ORDER_TYPES = [
  { value: "MARKET", label: "Маркет ордер" },
  { value: "LIMIT", label: "Лимит ордер" },
  { value: "POST_ONLY", label: "Только размещение" },
  { value: "STOP_MARKET", label: "Стоп Маркет" },
  { value: "STOP_LIMIT", label: "Стоп Лимит" },
];

export const ORDER_TYPE_LABELS = {
  MARKET: "Маркет ордер",
  LIMIT: "Лимит ордер",
  POST_ONLY: "Только размещение",
  STOP_MARKET: "Стоп Маркет",
  STOP_LIMIT: "Стоп Лимит",
};

export const ORDER_FIELDS_INFO = {
  LIMIT: {
    required: [
      { field: "timeInForce", label: "Время действия ордера", type: "select", options: ["GTC", "IOC", "FOK"] },
    ],
    optional: [
      { field: "reduceOnly", label: "Только закрытие позиции", type: "boolean" },
      { field: "positionSide", label: "Сторона позиции (для hedge mode)", type: "select", options: ["LONG", "SHORT", "BOTH"] },
      { field: "priceProtect", label: "Защита от проскальзывания", type: "boolean" },
    ],
    description: "Лимитный ордер требует указания времени действия (timeInForce): GTC (до отмены), IOC (немедленно или отмена), FOK (полностью или отмена)."
  },
  MARKET: {
    required: [],
    optional: [
      { field: "quoteOrderQty", label: "Сумма в котируемой валюте", type: "number", note: "Альтернатива полю quantity" },
      { field: "reduceOnly", label: "Только закрытие позиции", type: "boolean" },
      { field: "positionSide", label: "Сторона позиции (для hedge mode)", type: "select", options: ["LONG", "SHORT", "BOTH"] },
      { field: "closePosition", label: "Закрыть позицию", type: "boolean", note: "Вместо quantity" },
    ],
    description: "Рыночный ордер может использовать quantity или quoteOrderQty (сумма в USDT). Может быть использован для закрытия позиции (closePosition=true)."
  },
  STOP_LIMIT: {
    required: [
      { field: "stopPrice", label: "Стоп-цена активации", type: "number" },
      { field: "timeInForce", label: "Время действия ордера", type: "select", options: ["GTC", "IOC", "FOK"] },
      { field: "workingType", label: "Тип стоп-цены", type: "select", options: ["CONTRACT_PRICE", "MARK_PRICE"], note: "Контрактная цена или маркировочная" },
    ],
    optional: [
      { field: "reduceOnly", label: "Только закрытие позиции", type: "boolean" },
      { field: "positionSide", label: "Сторона позиции (для hedge mode)", type: "select", options: ["LONG", "SHORT", "BOTH"] },
      { field: "priceProtect", label: "Защита от проскальзывания", type: "boolean" },
    ],
    description: "Стоп-лимитный ордер требует stopPrice (цена активации), price (лимитная цена), quantity, timeInForce и workingType (тип стоп-цены)."
  },
  STOP_MARKET: {
    required: [
      { field: "stopPrice", label: "Стоп-цена активации", type: "number" },
      { field: "workingType", label: "Тип стоп-цены", type: "select", options: ["CONTRACT_PRICE", "MARK_PRICE"], note: "Контрактная цена или маркировочная" },
    ],
    optional: [
      { field: "closePosition", label: "Закрыть позицию", type: "boolean", note: "Вместо quantity" },
      { field: "reduceOnly", label: "Только закрытие позиции", type: "boolean" },
      { field: "positionSide", label: "Сторона позиции (для hedge mode)", type: "select", options: ["LONG", "SHORT", "BOTH"] },
      { field: "priceProtect", label: "Защита от проскальзывания", type: "boolean" },
    ],
    description: "Стоп-рыночный ордер требует stopPrice и workingType. Может использовать quantity или closePosition для закрытия всей позиции."
  },
  POST_ONLY: {
    required: [
      { field: "timeInForce", label: "Время действия ордера", type: "select", options: ["GTC", "IOC", "FOK"] },
    ],
    optional: [
      { field: "reduceOnly", label: "Только закрытие позиции", type: "boolean" },
      { field: "positionSide", label: "Сторона позиции (для hedge mode)", type: "select", options: ["LONG", "SHORT", "BOTH"] },
      { field: "priceProtect", label: "Защита от проскальзывания", type: "boolean" },
    ],
    description: "Ордер только размещение (POST_ONLY) размещается в книге ордеров как лимитный ордер и не исполняется немедленно."
  },
  TAKE_PROFIT: {
    required: [
      { field: "stopPrice", label: "Цена тейк-профит", type: "number" },
      { field: "timeInForce", label: "Время действия ордера", type: "select", options: ["GTC", "IOC", "FOK"] },
      { field: "workingType", label: "Тип стоп-цены", type: "select", options: ["CONTRACT_PRICE", "MARK_PRICE"], note: "Контрактная цена или маркировочная" },
    ],
    optional: [
      { field: "reduceOnly", label: "Только закрытие позиции", type: "boolean" },
      { field: "positionSide", label: "Сторона позиции (для hedge mode)", type: "select", options: ["LONG", "SHORT", "BOTH"] },
      { field: "priceProtect", label: "Защита от проскальзывания", type: "boolean" },
    ],
    description: "Тейк-профит лимитный требует stopPrice (цена тейк-профит), price (лимитная цена), quantity, timeInForce и workingType."
  },
  TAKE_PROFIT_MARKET: {
    required: [
      { field: "stopPrice", label: "Цена тейк-профит", type: "number" },
      { field: "workingType", label: "Тип стоп-цены", type: "select", options: ["CONTRACT_PRICE", "MARK_PRICE"], note: "Контрактная цена или маркировочная" },
    ],
    optional: [
      { field: "closePosition", label: "Закрыть позицию", type: "boolean", note: "Вместо quantity" },
      { field: "reduceOnly", label: "Только закрытие позиции", type: "boolean" },
      { field: "positionSide", label: "Сторона позиции (для hedge mode)", type: "select", options: ["LONG", "SHORT", "BOTH"] },
      { field: "priceProtect", label: "Защита от проскальзывания", type: "boolean" },
    ],
    description: "Тейк-профит рыночный требует stopPrice и workingType. Может использовать quantity или closePosition для закрытия всей позиции."
  },
  TRAILING_STOP_MARKET: {
    required: [
      { field: "callbackRate", label: "Процент отклонения (callback rate)", type: "number", note: "Процент (например, 1.5 для 1.5%)" },
      { field: "workingType", label: "Тип стоп-цены", type: "select", options: ["CONTRACT_PRICE", "MARK_PRICE"], note: "Контрактная цена или маркировочная" },
    ],
    optional: [
      { field: "closePosition", label: "Закрыть позицию", type: "boolean", note: "Вместо quantity" },
      { field: "reduceOnly", label: "Только закрытие позиции", type: "boolean" },
      { field: "positionSide", label: "Сторона позиции (для hedge mode)", type: "select", options: ["LONG", "SHORT", "BOTH"] },
    ],
    description: "Трейлинг-стоп требует callbackRate (процент отклонения цены) и workingType. Автоматически следует за ценой с заданным процентом."
  },
};

export const MIN_VOLUME_USD = 50000000;

export const COLORS = {
  background: {
    primary: "#191c27",
    secondary: "#2a2e39",
    tertiary: "#1f2329",
    hover: "#383E55",
  },
  border: {
    primary: "#383E55",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#9EAAC7",
  },
  price: {
    up: "#26a69a",
    down: "#ef5350",
  },
  button: {
    primary: "#26a69a",
    primaryHover: "#1e887a",
    danger: "#a85c50",
    dangerHover: "#8b4539",
  },
};

export const TVX_OPTIONS = [
  { value: "trend_after_pullback", label: "По тренду после отката" },
  { value: "abc", label: "ABC" },
  { value: "level_breakout", label: "Пробой уровня" },
  { value: "false_breakout", label: "Ложный пробой" },
  { value: "level_bounce", label: "Отбой от уровня" },
  { value: "breaker_block_retest", label: "Ретест от Брейкер блака" },
  { value: "order_block_retest", label: "Ретест от Ордер блока" },
  { value: "imbalance_retest", label: "Ретест от Имбаланса" },
  { value: "channel_exit", label: "Выход из Канала" },
  { value: "triangle_exit", label: "Выход Треугольник" },
];

export const TAKE_PROFIT_OPTIONS = Array.from({ length: 11 }, (_, i) => {
  const value = (i + 2).toString();
  return { value, label: `x${value}` };
});

export const EXPORT_POSITION_DATA_STRUCTURE = {
  createExportData: (positions) => ({
    totalPositions: positions.length,
    timestamp: new Date().toISOString(),
    positions: positions.map((pos) => ({
      id: pos.id,
      interval: pos.interval,
      symbol: pos.symbol,
      direction: pos.direction,
      prices: {
        entry: pos.entryPrice,
        stopLoss: pos.stopLoss,
        takeProfit: pos.takeProfit,
      },
      entryPt: {
        usdt: pos.entryPtUSDT,
        coins: pos.entryPtCoins,
      },
    })),
  }),
  createTableData: (positions) =>
    positions.map((pos, idx) => ({
      "#": idx + 1,
      Interval: pos.interval,
      Direction: pos.direction,
      Entry: pos.entryPrice,
      "Stop Loss": pos.stopLoss,
      "Take Profit": pos.takeProfit,
      "Entry-PT USDT": pos.entryPtUSDT || "-",
      "Entry-PT Coins": pos.entryPtCoins || "-",
    })),
};