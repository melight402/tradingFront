import { useState } from "react";
import { takeScreenshot } from "../utils/screenshot";
import { closePosition } from "../utils/api";
import { getPositionToolData } from "../utils/positionToolExtractor";

export const usePositionClose = (chart5mRef, chart1hRef, chart1dRef, symbol) => {
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
      const screenshotBlob = await takeScreenshot();

      const closeData = {
        symbol: positionData.symbol,
        lineToolId: positionData.lineToolId,
        dateTime: new Date().toISOString(),
        profitLoss: profitLoss,
        stopLossPrice: toolData.stopLossPrice,
        takeProfitPrice: toolData.takeProfitPrice,
      };
      
      await closePosition(closeData, screenshotBlob);

      localStorage.removeItem(`lastOpenPosition_${symbol}`);

      alert(`Позиция закрыта с ${profitLoss === "profit" ? "прибылью" : "убытком"}`);
      return true;
    } catch (error) {
      alert(`Ошибка при закрытии позиции: ${error.message}`);
      return false;
    } finally {
      setIsClosing(false);
    }
  };

  return { closePositionWithData, isClosing };
};

