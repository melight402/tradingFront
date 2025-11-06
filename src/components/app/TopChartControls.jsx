import React from "react";
import OrderTypeSelector from "../controls/OrderTypeSelector";
import TVXSelector from "../controls/TVXSelector";
import DrawingToolsSelector from "../controls/DrawingToolsSelector";
import DeleteTools from "../controls/DeleteTools";
import StopPriceInput from "../controls/StopPriceInput";
import ATRSlider from "../controls/ATRSlider";
import BuyButton from "../controls/BuyButton";
import SellButton from "../controls/SellButton";

export const TopChartControls = ({
  orderType,
  setOrderType,
  tvxValue,
  setTVXValue,
  drawingTool,
  setDrawingTool,
  stopPrice,
  setStopPrice,
  atrValue,
  setAtrValue,
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
          <ATRSlider value={atrValue} onChange={setAtrValue} />
          <BuyButton onClick={() => {}} />
          <SellButton onClick={() => {}} />
        </div>
      </div>
    </>
  );
};

