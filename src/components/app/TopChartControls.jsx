import React from "react";
import OrderTypeSelector from "../controls/OrderTypeSelector";
import TVXSelector from "../controls/TVXSelector";
import DrawingToolsSelector from "../controls/DrawingToolsSelector";
import DeleteTools from "../controls/DeleteTools";
import StopPriceInput from "../controls/StopPriceInput";
import ProfitLossSelector from "../controls/ProfitLossSelector";
import ClosePositionButton from "../chart/ClosePositionButton";
import ExportPositionData from "../chart/ExportPositionData";

export const TopChartControls = ({
  orderType,
  setOrderType,
  tvxValue,
  setTVXValue,
  drawingTool,
  setDrawingTool,
  stopPrice,
  setStopPrice,
  profitLoss,
  setProfitLoss,
  chart5mRef,
  chart1hRef,
  chart1dRef,
  symbol,
  risk,
  deleteToolsHandlers,
}) => {
  return (
    <>
      <div className="chart-controls-first-row-subrow">
        <div className="chart-controls-first-row-left">
          <OrderTypeSelector orderType={orderType} onOrderTypeChange={setOrderType} />
          <TVXSelector tvxValue={tvxValue} onTVXChange={setTVXValue} />
          <DrawingToolsSelector drawingTool={drawingTool} onDrawingToolChange={setDrawingTool} />
        </div>
      </div>
      <div className="chart-controls-first-row-subrow">
        <DeleteTools {...deleteToolsHandlers} />
        <div className="chart-controls-first-row-right">
          <StopPriceInput value={stopPrice} onChange={setStopPrice} />
          <ProfitLossSelector value={profitLoss} onChange={setProfitLoss} />
          <ClosePositionButton
            chart5mRef={chart5mRef}
            chart1hRef={chart1hRef}
            chart1dRef={chart1dRef}
            symbol={symbol}
            profitLoss={profitLoss}
          />
          <ExportPositionData
            chart5mRef={chart5mRef}
            chart1hRef={chart1hRef}
            chart1dRef={chart1dRef}
            symbol={symbol}
            orderType={orderType}
            tvxValue={tvxValue}
            risk={risk}
            stopPrice={stopPrice}
          />
        </div>
      </div>
    </>
  );
};

