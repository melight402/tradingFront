import { useState } from "react";
import { usePositionExport } from "./usePositionExport";
import { usePositionOpening } from "./usePositionOpening";
import { useQuantityValidation } from "./useQuantityValidation";
import { loadTopChartTimeframe } from "../services/localStorageUtils";

export const usePositionExportFlow = (
  chart5mRef,
  chart1hRef,
  chart1dRef,
  symbol,
  orderType,
  tvxValue,
  risk,
  stopPrice
) => {
  const [isExporting, setIsExporting] = useState(false);
  const { exportPosition } = usePositionExport(
    chart5mRef,
    chart1hRef,
    chart1dRef,
    symbol,
    orderType,
    tvxValue,
    risk
  );
  const { openPositionWithData, confirmationModal } = usePositionOpening();
  const { validateQuantity } = useQuantityValidation();

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const result = await exportPosition();
      if (!result) {
        return;
      }

      const { positions, finalValues, lastTool } = result;

      if (finalValues.entryPrice && finalValues.stopLoss && finalValues.direction) {
        const quantityResult = validateQuantity(risk, finalValues.entryPrice, finalValues.stopLoss, symbol);
        
        if (!quantityResult.isValid) {
          alert(quantityResult.error);
          return;
        }

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
          lastTool,
          loadTopChartTimeframe()
        );

        if (success) {
          alert("Позиция успешно открыта");
        }
      } else {
        alert(`Успешно экспортировано ${positions.length} позиций`);
      }
    } catch (err) {
      alert(`Ошибка при экспорте: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return { handleExport, isExporting, confirmationModal };
};

