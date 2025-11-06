import React from "react";
import RiskInput from "../controls/RiskInput";
import ProfitLossSelector from "../controls/ProfitLossSelector";
import ClosePositionButton from "../chart/ClosePositionButton";
import ExportPositionData from "../chart/ExportPositionData";

export const TopChartRightControls = ({
  risk,
  setRisk,
  profitLoss,
  setProfitLoss,
  chart5mRef,
  chart1hRef,
  chart1dRef,
  symbol,
  orderType,
  tvxValue,
  stopPrice,
}) => {
  return (
    <>
      <RiskInput risk={risk} onRiskChange={setRisk} />
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
    </>
  );
};

