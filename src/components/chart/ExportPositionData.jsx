import React from "react";
import { usePositionExportFlow } from "../../hooks/usePositionExportFlow";
import OrderConfirmationModal from "../modals/OrderConfirmationModal";
import "../../styles/styles.css";

const ExportPositionData = ({ 
  chart5mRef, 
  chart1hRef, 
  chart1dRef, 
  symbol, 
  orderType,
  tvxValue,
  risk,
  stopPrice,
}) => {
  const { handleExport, isExporting, confirmationModal } = usePositionExportFlow(
    chart5mRef,
    chart1hRef,
    chart1dRef,
    symbol,
    orderType,
    tvxValue,
    risk,
    stopPrice
  );

  return (
    <>
      <button
        className="export-button"
        onClick={handleExport}
        disabled={isExporting}
      >
        {isExporting ? "Открытие..." : "Открыть позицию"}
      </button>
      <OrderConfirmationModal
        isOpen={confirmationModal.isOpen}
        onConfirm={confirmationModal.handleConfirm}
        onCancel={confirmationModal.handleCancel}
        reason={confirmationModal.confirmationData?.reason}
        orderPrice={confirmationModal.confirmationData?.orderPrice}
        marketPrice={confirmationModal.confirmationData?.marketPrice}
      />
    </>
  );
};

export default ExportPositionData;
