import { EXPORT_POSITION_DATA_STRUCTURE } from "../constants";

export const usePositionLogging = () => {
  const logPositions = (positions) => {
    console.log("=== Экспорт данных позиций ===");
    console.log(`Найдено позиций: ${positions.length}`);
    console.log("\n--- Данные позиций ---");

    positions.forEach((position, index) => {
      console.log(`\nПозиция ${index + 1}:`, {
        id: position.id,
        interval: position.interval,
        symbol: position.symbol,
        direction: position.direction,
        entryPrice: position.entryPrice,
        stopLoss: position.stopLoss,
        takeProfit: position.takeProfit,
        entryPtUSDT: position.entryPtUSDT,
        entryPtCoins: position.entryPtCoins,
      });
    });

    console.log("\n--- Все позиции (объект) ---");
    const exportData = EXPORT_POSITION_DATA_STRUCTURE.createExportData(positions);
    console.log(exportData);

    console.log("\n--- Таблица позиций ---");
    console.table(EXPORT_POSITION_DATA_STRUCTURE.createTableData(positions));
  };

  const logQuantityCalculation = (calculatedQuantity, roundedQuantity, symbol) => {
    console.log("\n--- Расчет quantity ---");
    console.log("Calculated quantity:", calculatedQuantity);
    console.log("Rounded quantity:", roundedQuantity);
    console.log("Symbol:", symbol);
  };

  return { logPositions, logQuantityCalculation };
};

