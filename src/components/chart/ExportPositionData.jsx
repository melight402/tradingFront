import React from "react";
import { usePositionExportFlow } from "../../hooks/usePositionExportFlow";
import "../../styles/styles.css";

const ExportPositionData = ({ 
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
}) => {
  const { handleExport, isExporting } = usePositionExportFlow(
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

  return (
    <button
      className="export-button"
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? "Открытие..." : "Открыть позицию"}
    </button>
  );
};

export default ExportPositionData;
