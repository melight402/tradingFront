import { EXPORT_POSITION_DATA_STRUCTURE } from "../constants";

export const usePositionLogging = () => {
  const logPositions = (positions) => {
    EXPORT_POSITION_DATA_STRUCTURE.createExportData(positions);
  };

  const logQuantityCalculation = () => {
  };

  return { logPositions, logQuantityCalculation };
};

