# Сравнение логики графиков: chart5m (верхний), chart1h (нижний левый), chart1d (нижний правый)

## 1. ИНИЦИАЛИЗАЦИЯ И КОНФИГУРАЦИЯ

### ChartLayout.jsx
**chart5m (верхний):**
- `initialInterval="5m"`
- `chartKey="chart5m"`
- `volumeAreaHeight={0.14}`
- `limit={1500}`
- `firstRowContent={topChartFirstRow}` - получает специальные контролы
- `secondRowCenter={topChartSecondRowCenter}` - null
- `secondRowRight={topChartSecondRowRight}` - получает специальные контролы
- `collapseButtonProps={{ isCollapsed, toggleCollapse }}` - имеет кнопку сворачивания нижних графиков

**chart1h (нижний левый):**
- `initialInterval="1h"`
- `chartKey="chart1h"`
- `volumeAreaHeight={0.14}`
- `limit={1500}`
- `firstRowContent={null}` - нет специальных контролов
- `secondRowCenter={null}`
- `secondRowRight={null}`
- `collapseButtonProps={null}` - нет кнопки сворачивания

**chart1d (нижний правый):**
- `initialInterval="1d"`
- `chartKey="chart1d"`
- `volumeAreaHeight={0.14}`
- `limit={1500}`
- `firstRowContent={null}` - нет специальных контролов
- `secondRowCenter={null}`
- `secondRowRight={null}`
- `collapseButtonProps={null}` - нет кнопки сворачивания

---

## 2. УПРАВЛЕНИЕ ТАЙМФРЕЙМОМ

### ChartSection.jsx
**chart5m (верхний):**
```12:37:tradingFront/src/components/chart/ChartSection.jsx
const isTopChart = chartKey === "chart5m";

const [interval, setInterval] = useState(() => {
  if (isTopChart) {
    const saved = loadTopChartTimeframe(initialInterval);
    return VALID_INTERVALS.has(saved) ? saved : initialInterval;
  }
  return initialInterval;
});

useEffect(() => {
  if (isTopChart) {
    saveTopChartTimeframe(interval);
  }
}, [interval, isTopChart]);
```
- **СОХРАНЯЕТ таймфрейм в localStorage** через `saveTopChartTimeframe()`
- **ЗАГРУЖАЕТ сохраненный таймфрейм** при инициализации через `loadTopChartTimeframe()`
- Может изменять таймфрейм через селект

**chart1h (нижний левый):**
- **НЕ сохраняет** таймфрейм в localStorage
- Всегда использует `initialInterval="1h"`
- Может изменять таймфрейм через селект, но не сохраняет

**chart1d (нижний правый):**
- **НЕ сохраняет** таймфрейм в localStorage
- Всегда использует `initialInterval="1d"`
- Может изменять таймфрейм через селект, но не сохраняет

---

## 3. ДАННЫЕ И ЗАГРУЗКА

### ChartDataContext.jsx
**Все три графика:**
- Используют одинаковую логику загрузки данных через `useChartData(chartKey, symbol, interval, limit)`
- Ключ данных формируется как: `${chartKey}-${symbol}-${interval}`
- Все используют одинаковый `limit={1500}`
- Все используют одинаковую логику подписки на WebSocket через `subscribeToCandles`

**Различий в загрузке данных НЕТ** - все используют одинаковую цепочку:
- `useChartDataLoader` → `fetchWithRetry` → `convertKlineData` → `subscribeToCandles`

---

## 4. ОБНОВЛЕНИЕ ДАННЫХ

### useChartDataUpdates.js
**Все три графика:**
- Используют одинаковую логику обновления через `useChartDataUpdates`
- Все используют `updateLastCandle` для обновления последней свечи
- Все используют `processChartData` для обработки данных
- Все используют одинаковую логику восстановления состояния из `getLastCandle()`

**Различий в обновлении данных НЕТ**

### useChartDataSync.js
**Все три графика:**
- Используют одинаковую логику синхронизации данных
- Все регистрируют callback через `setOnLastCandleUpdate(updateLastCandle)`
- Все используют одинаковую логику восстановления инструментов через `restoreLineTools`

**Различий в синхронизации данных НЕТ**

---

## 5. СОХРАНЕНИЕ И ВОССТАНОВЛЕНИЕ СОСТОЯНИЯ

### ChartStateContext.jsx
**Все три графика:**
- Используют одинаковую логику сохранения состояния через `setChartState(chartKey, symbol, interval, state)`
- Ключ состояния: `${chartKey}_${symbol}_${interval}`
- Все сохраняют: `logicalRange`, `timeRange`, `priceScale`, `priceRange`

**Различий в сохранении состояния НЕТ** - каждый график сохраняет свое состояние отдельно по ключу

### chartStateStorage.js
**Все три графика:**
- Используют одинаковую логику сохранения в localStorage
- Ключ: `tradingFront_chartState_${chartKey}_${symbol}_${interval}`
- Все используют одинаковые функции `saveChartState()` и `loadChartState()`

**Различий в хранилище состояния НЕТ**

---

## 6. ИНСТРУМЕНТЫ РИСОВАНИЯ (LINE TOOLS)

### useChartLineTools.js
**Все три графика:**
- Используют одинаковую логику восстановления инструментов
- Все используют `useLineToolRestore` для восстановления
- Все используют `useDrawingToolActivation` для активации инструментов
- Все используют `useLineToolEditHandler` для редактирования

**Различий в работе с инструментами НЕТ**

### useLineToolsUpdate.js
**Все три графика:**
```3:36:tradingFront/src/hooks/useLineToolsUpdate.js
export const useLineToolsUpdate = (chart5mRef, chart1hRef, chart1dRef, symbol, risk) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const charts = [
      { chart: chart5mRef.current, interval: '5m' },
      { chart: chart1hRef.current, interval: '1h' },
      { chart: chart1dRef.current, interval: '1d' }
    ].filter(item => item.chart);

    charts.forEach(({ chart }) => {
      // ... одинаковый код для всех
    });
  }, [symbol, risk, chart5mRef, chart1hRef, chart1dRef]);
};
```
- **Одинаковая логика обновления** для всех трех графиков
- Все обновляют `LongShortPosition` инструменты с новым `symbol` и `risk`

**Различий НЕТ**

---

## 7. MOVING AVERAGES (Скользящие средние)

### useMovingAverages.js
**chart5m (верхний):**
```13:31:tradingFront/src/hooks/useMovingAverages.js
if (chartKey !== "chart1d") {
  if (ma50Series.current) {
    try {
      chart.current.removeSeries(ma50Series.current);
    } catch {
      void 0;
    }
    ma50Series.current = null;
  }
  if (ma200Series.current) {
    try {
      chart.current.removeSeries(ma200Series.current);
    } catch {
      void 0;
    }
    ma200Series.current = null;
  }
  return;
}
```
- **НЕ показывает** MA50 и MA200
- Удаляет серии, если они были созданы

**chart1h (нижний левый):**
- **НЕ показывает** MA50 и MA200
- Удаляет серии, если они были созданы

**chart1d (нижний правый):**
```33:70:tradingFront/src/hooks/useMovingAverages.js
if (!ma50Series.current) {
  ma50Series.current = chart.current.addLineSeries({
    color: "#2196f3",
    lineWidth: 2,
    priceFormat: {
      type: "price",
      precision: 2,
      minMove: 0.01,
    },
    priceScaleId: "right",
    title: "MA50",
  });
}

if (!ma200Series.current) {
  ma200Series.current = chart.current.addLineSeries({
    color: "#ffeb3b",
    lineWidth: 2,
    priceFormat: {
      type: "price",
      precision: 2,
      minMove: 0.01,
    },
    priceScaleId: "right",
    title: "MA200",
  });
}

const ma50Data = calculateMA(data, 50);
const ma200Data = calculateMA(data, 200);

if (ma50Data.length > 0) {
  ma50Series.current.setData(ma50Data);
}

if (ma200Data.length > 0) {
  ma200Series.current.setData(ma200Data);
}
```
- **ПОКАЗЫВАЕТ MA50 и MA200**
- Создает две серии линий
- Рассчитывает и отображает скользящие средние

**КРИТИЧЕСКОЕ РАЗЛИЧИЕ:** Только chart1d показывает скользящие средние

---

## 8. UI КОНТРОЛЫ

### ChartHeader.jsx
**chart5m (верхний):**
- Получает `firstRowContent={topChartFirstRow}` - специальные контролы торговли
- Получает `secondRowRight={topChartSecondRowRight}` - контролы риска и соотношения
- Имеет `collapseButtonProps` - кнопка сворачивания нижних графиков
- Показывает ленту сделок (Time & Sales) для всех графиков одинаково

**chart1h (нижний левый):**
- `firstRowContent={null}` - нет специальных контролов
- `secondRowRight={null}` - нет специальных контролов
- `collapseButtonProps={null}` - нет кнопки сворачивания
- Показывает ленту сделок (Time & Sales)

**chart1d (нижний правый):**
- `firstRowContent={null}` - нет специальных контролов
- `secondRowRight={null}` - нет специальных контролов
- `collapseButtonProps={null}` - нет кнопки сворачивания
- Показывает ленту сделок (Time & Sales)

**КРИТИЧЕСКОЕ РАЗЛИЧИЕ:** Только chart5m имеет специальные торговые контролы

### TopChartControls.jsx
**Используется ТОЛЬКО для chart5m:**
- Компоненты торговли (OrderType, TVX, Drawing Tools, Stop Price, Profit/Loss)
- Кнопки экспорта и закрытия позиций
- Все эти контролы передаются через `firstRowContent` только в chart5m

### TopChartRightControls.jsx
**Используется ТОЛЬКО для chart5m:**
- Контролы риска (Risk)
- Контролы соотношения (Ratio)
- Передается через `secondRowRight` только в chart5m

---

## 9. РАБОТА С ПОЗИЦИЯМИ

### usePositionExtractor.js, usePositionExport.js, usePositionClose.js
**Все три графика:**
- Используются в функциях поиска позиций во всех трех графиках
- `getLastPositionTool()` ищет позиции во всех трех графиках
- `extractPositionData()` извлекает данные из всех трех графиков
- `getPositionToolData()` ищет позицию по ID во всех трех графиках

**Логика одинаковая** - все три графика участвуют в поиске и обработке позиций

### useHorizontalLinePrice.js
**Все три графика:**
```3:7:tradingFront/src/hooks/useHorizontalLinePrice.js
const getHorizontalLinePrice = (chart5mRef, chart1hRef, chart1dRef) => {
  const charts = [
    { chart: chart5mRef?.current, interval: "5m" },
    { chart: chart1hRef?.current, interval: "1h" },
    { chart: chart1dRef?.current, interval: "1d" },
```
- Ищет горизонтальные линии во всех трех графиках
- Возвращает цену первой найденной линии

**Логика одинаковая** - все три графика участвуют в поиске

---

## 10. ИНИЦИАЛИЗАЦИЯ ГРАФИКА

### useChartInitialization.js
**Все три графика:**
- Используют одинаковую логику инициализации
- Одинаковые настройки: цвета, сетка, crosshair, price scales, time scale
- Одинаковые настройки серий: candlestick и volume
- Одинаковая логика обработки размера контейнера

**Различий НЕТ**

---

## 11. ОБРАБОТКА ИЗМЕНЕНИЙ СИМВОЛА/ИНТЕРВАЛА

### PriceChart.jsx
**Все три графика:**
```51:110:tradingFront/src/components/chart/PriceChart.jsx
useEffect(() => {
  if (!chart.current || !candlestickSeries.current) return;
  if (prevIntervalRef.current === interval && prevSymbolRef.current === symbol) return;
  
  const oldSymbol = prevSymbolRef.current;
  const oldInterval = prevIntervalRef.current;
  
  if (oldSymbol && oldInterval && chart.current && candlestickSeries.current) {
    try {
      const timeScale = chart.current.timeScale();
      const priceScale = chart.current.priceScale('right');
      
      if (timeScale && priceScale) {
        const state = {};
        
        const logicalRange = timeScale.getVisibleLogicalRange();
        const timeRange = timeScale.getVisibleRange();
        
        if (logicalRange && typeof logicalRange.from === 'number' && typeof logicalRange.to === 'number' && 
            !isNaN(logicalRange.from) && !isNaN(logicalRange.to)) {
          state.logicalRange = logicalRange;
        }
        if (timeRange && timeRange.from != null && timeRange.to != null) {
          state.timeRange = timeRange;
        }
        
        try {
          const priceScaleOptions = priceScale.options();
          state.priceScale = {
            autoScale: priceScaleOptions?.autoScale ?? true,
            scaleMargins: priceScaleOptions?.scaleMargins
          };
          
          try {
            const visibleRange = priceScale.getVisibleRange();
            if (visibleRange && visibleRange.minValue !== null && visibleRange.maxValue !== null) {
              state.priceRange = {
                from: visibleRange.minValue,
                to: visibleRange.maxValue
              };
            }
          } catch {
            void 0;
            void 0;
          }
        } catch {
          void 0;
          void 0;
        }
        
        if (state.logicalRange || state.timeRange || state.priceScale || state.priceRange) {
          setChartState(chartKey, oldSymbol, oldInterval, state);
        }
      }
    } catch {
      void 0;
      void 0;
    }
  }
}, [symbol, interval, chart, candlestickSeries, chartKey]);
```
- **Одинаковая логика** сохранения состояния при смене символа/интервала
- Все сохраняют состояние перед сменой

**Различий НЕТ**

---

## 12. КОНТЕКСТНОЕ МЕНЮ

### PriceChart.jsx
**Все три графика:**
```178:239:tradingFront/src/components/chart/PriceChart.jsx
const handleContainerContextMenu = (e) => {
  e.preventDefault();
  if (chart.current && currentSymbolRef.current && currentIntervalRef.current) {
    const exported = exportLineToolsFromChart(chart.current);
    if (exported) {
      setLineTools(currentSymbolRef.current, currentIntervalRef.current, exported);
    }
    
    try {
      const timeScale = chart.current.timeScale();
      const priceScale = chart.current.priceScale('right');
      
      const state = {};
      
      if (timeScale) {
        const logicalRange = timeScale.getVisibleLogicalRange();
        const timeRange = timeScale.getVisibleRange();
        
        if (logicalRange && typeof logicalRange.from === 'number' && typeof logicalRange.to === 'number' && 
            !isNaN(logicalRange.from) && !isNaN(logicalRange.to)) {
          state.logicalRange = logicalRange;
        }
        if (timeRange && timeRange.from != null && timeRange.to != null) {
          state.timeRange = timeRange;
        }
      }
      
      if (priceScale && candlestickSeries.current) {
        try {
          const priceScaleOptions = priceScale.options();
          state.priceScale = {
            autoScale: priceScaleOptions?.autoScale ?? true,
            scaleMargins: priceScaleOptions?.scaleMargins
          };
          
          try {
            const visibleRange = priceScale.getVisibleRange();
            if (visibleRange && visibleRange.minValue !== null && visibleRange.maxValue !== null) {
              state.priceRange = {
                from: visibleRange.minValue,
                to: visibleRange.maxValue
              };
            }
          } catch {
            void 0;
            void 0;
          }
        } catch {
          void 0;
          void 0;
        }
      }
      
      if (state.logicalRange || state.timeRange || state.priceScale || state.priceRange) {
        setChartState(chartKey, currentSymbolRef.current, currentIntervalRef.current, state);
      }
    } catch {
      void 0;
      void 0;
    }
  }
};
```
- **Одинаковая логика** сохранения инструментов и состояния через контекстное меню

**Различий НЕТ**

---

## 13. TIME & SALES (Лента сделок)

### ChartHeader.jsx
**Все три графика:**
```23:44:tradingFront/src/components/chart/ChartHeader.jsx
const tapeKey = `${chartKey}-${symbol}-${interval}`;
const { buySum, sellSum, loading } = useTimeAndSalesData(tapeKey, symbol, interval);

useEffect(() => {
  if (!lastCandle || !lastCandle.date) {
    return;
  }

  const unsubscribe = subscribeToTape(tapeKey, symbol, interval, lastCandle);

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}, [symbol, interval, lastCandle, tapeKey, subscribeToTape]);

useEffect(() => {
  if (lastCandle && lastCandle.date) {
    updateLastCandleForTape(tapeKey, symbol, interval, lastCandle);
  }
}, [symbol, interval, lastCandle, tapeKey, updateLastCandleForTape]);
```
- **Одинаковая логика** подписки на ленту сделок
- Каждый график использует свой `tapeKey`: `${chartKey}-${symbol}-${interval}`
- Все показывают одинаковую информацию: покупка/продажа

**Различий НЕТ** - каждый график имеет свою независимую подписку

---

## 14. CSS И СТИЛИ

### styles.css
**chart5m (верхний):**
- Класс: `.app-top-section` - верхняя секция
- Имеет доступ к кнопке сворачивания через `collapseButtonProps`

**chart1h (нижний левый):**
- Класс: `.app-bottom-section .app-chart-wrapper` (первый)
- Может быть скрыт через `.app-bottom-section-collapsed`

**chart1d (нижний правый):**
- Класс: `.app-bottom-section .app-chart-wrapper` (второй)
- Может быть скрыт через `.app-bottom-section-collapsed`

**КРИТИЧЕСКОЕ РАЗЛИЧИЕ:** Только нижние графики могут быть свернуты кнопкой на верхнем графике

---

## ИТОГОВАЯ СВОДКА РАЗЛИЧИЙ

### КРИТИЧЕСКИЕ РАЗЛИЧИЯ:

1. **Таймфрейм по умолчанию:**
   - chart5m: `5m`
   - chart1h: `1h`
   - chart1d: `1d`

2. **Сохранение таймфрейма:**
   - chart5m: **СОХРАНЯЕТ** в localStorage
   - chart1h: **НЕ сохраняет**
   - chart1d: **НЕ сохраняет**

3. **UI Контролы:**
   - chart5m: **ИМЕЕТ** TopChartControls и TopChartRightControls
   - chart1h: **НЕ имеет** специальных контролов
   - chart1d: **НЕ имеет** специальных контролов

4. **Moving Averages:**
   - chart5m: **НЕ показывает** MA50/MA200
   - chart1h: **НЕ показывает** MA50/MA200
   - chart1d: **ПОКАЗЫВАЕТ** MA50/MA200

5. **Кнопка сворачивания:**
   - chart5m: **ИМЕЕТ** кнопку сворачивания нижних графиков
   - chart1h: **НЕ имеет** кнопки
   - chart1d: **НЕ имеет** кнопки

6. **Позиция в layout:**
   - chart5m: Верхняя секция (`.app-top-section`)
   - chart1h: Нижняя секция, левый (первый `.app-chart-wrapper`)
   - chart1d: Нижняя секция, правый (второй `.app-chart-wrapper`)

### ОДИНАКОВАЯ ЛОГИКА:

1. Загрузка данных (ChartDataContext, useChartDataLoader)
2. Обновление данных (useChartDataUpdates, useChartDataSync)
3. Сохранение состояния графика (ChartStateContext, chartStateStorage)
4. Инструменты рисования (useChartLineTools, useLineToolsUpdate)
5. Инициализация графика (useChartInitialization)
6. Обработка изменений символа/интервала
7. Контекстное меню
8. Time & Sales (каждый со своим ключом)
9. Работа с позициями (все три графика участвуют)
10. Поиск горизонтальных линий (все три графика участвуют)

---

## ВЫВОДЫ

**Основные различия касаются:**
1. UI и контролов (только chart5m имеет торговые контролы)
2. Сохранения таймфрейма (только chart5m сохраняет)
3. Moving Averages (только chart1d показывает)
4. Позиции в layout и возможности сворачивания

**Вся остальная логика (данные, обновления, состояние, инструменты) - ОДИНАКОВАЯ для всех трех графиков.**

