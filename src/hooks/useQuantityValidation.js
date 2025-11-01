import { calculatePositionQuantity } from "../utils/positionCalculations";
import { roundQuantityToStepSize } from "../utils/tickSizeCache";

export const useQuantityValidation = () => {
  const validateQuantity = (risk, entryPrice, stopLoss, symbol) => {
    const calculatedQuantity = calculatePositionQuantity(
      parseFloat(risk) || 0,
      entryPrice,
      stopLoss
    );

    const roundedQuantity = roundQuantityToStepSize(calculatedQuantity, symbol);

    if (!roundedQuantity || roundedQuantity <= 0) {
      return {
        isValid: false,
        error: "Количество позиции равно нулю. Проверьте значения риска, цены входа и стоп-лосса.",
      };
    }

    return {
      isValid: true,
      calculatedQuantity,
      roundedQuantity,
    };
  };

  return { validateQuantity };
};

