import React from "react";
import OpenCloseSelector from "../controls/OpenCloseSelector";
import OrderTypeSelector from "../controls/OrderTypeSelector";
import TVXSelector from "../controls/TVXSelector";
import DrawingToolsSelector from "../controls/DrawingToolsSelector";
import DeleteTools from "../controls/DeleteTools";
import StopPriceInput from "../controls/StopPriceInput";
import PurchasePriceInput from "../controls/PurchasePriceInput";
import ManualStopLossInput from "../controls/ManualStopLossInput";

export const TopChartControls = ({
  openClose,
  setOpenClose,
  orderType,
  setOrderType,
  tvxValue,
  setTVXValue,
  drawingTool,
  setDrawingTool,
  stopPrice,
  setStopPrice,
  purchasePrice,
  setPurchasePrice,
  manualStopLoss,
  setManualStopLoss,
  deleteToolsHandlers,
}) => {
  return (
    <>
      <div className="chart-controls-first-row-subrow">
        <div className="chart-controls-first-row-left">
          <OpenCloseSelector value={openClose} onChange={setOpenClose} />
          <OrderTypeSelector orderType={orderType} onOrderTypeChange={setOrderType} />
          <TVXSelector tvxValue={tvxValue} onTVXChange={setTVXValue} />
          <DrawingToolsSelector drawingTool={drawingTool} onDrawingToolChange={setDrawingTool} />
        </div>
      </div>
      <div className="chart-controls-first-row-subrow">
        <DeleteTools {...deleteToolsHandlers} />
        <div className="chart-controls-first-row-right">
          <StopPriceInput value={stopPrice} onChange={setStopPrice} />
          <PurchasePriceInput value={purchasePrice} onChange={setPurchasePrice} />
          <ManualStopLossInput value={manualStopLoss} onChange={setManualStopLoss} />
        </div>
      </div>
    </>
  );
};

