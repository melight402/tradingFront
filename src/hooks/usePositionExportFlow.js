import { useState } from "react";
import { usePositionExport } from "./usePositionExport";
import { usePositionOpening } from "./usePositionOpening";
import { useQuantityValidation } from "./useQuantityValidation";

export const usePositionExportFlow = (
  chart5mRef,
  chart1hRef,
  chart1dRef,
  symbol,
  openClose,
  orderType,
  tvxValue,
  risk,
  stopPrice,
  purchasePrice,
  manualStopLoss
) => {
  const [isExporting, setIsExporting] = useState(false);
  const { exportPosition } = usePositionExport(
    chart5mRef,
    chart1hRef,
    chart1dRef,
    symbol,
    openClose,
    orderType,
    tvxValue,
    risk,
    stopPrice,
    purchasePrice,
    manualStopLoss
  );
  const { openPositionWithData } = usePositionOpening();
  const { validateQuantity } = useQuantityValidation();

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const result = await exportPosition();
      if (!result) {
        return;
      }

      const { positions, finalValues, lastTool } = result;

      if (openClose === "open" && finalValues.entryPrice && finalValues.stopLoss && finalValues.direction) {
        const quantityResult = validateQuantity(risk, finalValues.entryPrice, finalValues.stopLoss, symbol);
        
        if (!quantityResult.isValid) {
          alert(quantityResult.error);
          return;
        }
      }

      if (openClose === "open" && finalValues.entryPrice && finalValues.stopLoss && finalValues.direction) {
        const success = await openPositionWithData(
          finalValues.entryPrice,
          finalValues.stopLoss,
          finalValues.takeProfit,
          finalValues.direction,
          symbol,
          orderType,
          tvxValue,
          stopPrice,
          risk,
          lastTool
        );

        if (success) {
          alert("Позиция успешно открыта");
        }
      } else {
        alert(`Успешно экспортировано ${positions.length} позиций`);
      }
    } catch (error) {
      console.error("Ошибка при экспорте:", error);
      alert(`Ошибка при экспорте: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return { handleExport, isExporting };
};

