import React from "react";
import RiskInput from "../controls/RiskInput";
import ATRSlider from "../controls/ATRSlider";
import BuyButton from "../controls/BuyButton";
import SellButton from "../controls/SellButton";

export const TopChartRightControls = ({
  risk,
  setRisk,
  atrValue,
  setAtrValue,
}) => {
  return (
    <>
      <RiskInput risk={risk} onRiskChange={setRisk} />
      <ATRSlider value={atrValue} onChange={setAtrValue} />
      <BuyButton onClick={() => {}} />
      <SellButton onClick={() => {}} />
    </>
  );
};

