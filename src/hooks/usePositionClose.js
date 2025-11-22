import { useState } from "react";
import { takeScreenshot } from "../utils/screenshot";
import { closePosition } from "../utils/api";
import { getPositionToolData } from "../utils/positionToolExtractor";

export const usePositionClose = (chart5mRef, chart1hRef, chart1dRef, symbol, tradeNote) => {
  const [isClosing, setIsClosing] = useState(false);

  const closePositionWithData = async (profitLoss) => {
    if (!profitLoss) {
      alert("Выберите прибыль или убыток");
      return false;
    }

    const lastOpenPositionData = localStorage.getItem(`lastOpenPosition_${symbol}`);
    if (!lastOpenPositionData) {
      alert("Не найдена открытая позиция для этого символа");
      return false;
    }

    let positionData;
    try {
      positionData = JSON.parse(lastOpenPositionData);
    } catch {
      void 0;
      alert("Ошибка при чтении данных открытой позиции");
      return false;
    }

    if (!positionData.lineToolId) {
      alert("Не найден ID инструмента в данных позиции");
      return false;
    }

    const toolData = getPositionToolData(chart5mRef, chart1hRef, chart1dRef, positionData.lineToolId);
    if (!toolData) {
      alert("Не найден инструмент рисования на графиках");
      return false;
    }

    setIsClosing(true);

    try {
      let screenshotBlob = null;
      try {
        screenshotBlob = await takeScreenshot();
      } catch {
      void 0;
        const shouldContinue = confirm('Не удалось создать скриншот при закрытии. Продолжить закрытие позиции без скриншота?');
        if (!shouldContinue) {
          setIsClosing(false);
          return false;
        }
      }

      const closeData = {
        symbol: positionData.symbol,
        lineToolId: positionData.lineToolId,
        dateTime: new Date().toISOString(),
        profitLoss: profitLoss,
        stopLossPrice: toolData.stopLossPrice,
        takeProfitPrice: toolData.takeProfitPrice,
        note: tradeNote || null,
      };
      
      
      const result = await closePosition(closeData, screenshotBlob);
      
      if (result.data?.closeScreenshotPath) {
        void 0;
      } else {
        void 0;
      }

      localStorage.removeItem(`lastOpenPosition_${symbol}`);

      alert(`Позиция закрыта с ${profitLoss === "profit" ? "прибылью" : "убытком"}`);
      return true;
    } catch (err) {
      alert(`Ошибка при закрытии позиции: ${err.message}`);
      return false;
    } finally {
      setIsClosing(false);
    }
  };

  return { closePositionWithData, isClosing };
};

