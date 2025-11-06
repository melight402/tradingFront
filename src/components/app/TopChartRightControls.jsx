import React from "react";
import RiskInput from "../controls/RiskInput";
import RatioSelector from "../controls/RatioSelector";
import ATRSlider from "../controls/ATRSlider";
import BuyButton from "../controls/BuyButton";
import SellButton from "../controls/SellButton";

export const TopChartRightControls = ({
  risk,
  setRisk,
  ratio,
  setRatio,
  atrValue,
  setAtrValue,
}) => {
  return (
    <>
      <RiskInput risk={risk} onRiskChange={setRisk} />
      <RatioSelector value={ratio} onChange={setRatio} />
      <ATRSlider value={atrValue} onChange={setAtrValue} />
      <BuyButton onClick={() => {}} />
      <SellButton onClick={() => {}} />
    </>
  );
};

