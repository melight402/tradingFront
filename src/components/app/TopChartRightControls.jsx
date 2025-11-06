import React from "react";
import RiskInput from "../controls/RiskInput";
import RatioSelector from "../controls/RatioSelector";
import ATRSlider from "../controls/ATRSlider";
import BuyButton from "../controls/BuyButton";
import SellButton from "../controls/SellButton";
import { useMarketOrderPlacement } from "../../hooks/useMarketOrderPlacement";

export const TopChartRightControls = ({
  risk,
  setRisk,
  ratio,
  setRatio,
  atrValue,
  setAtrValue,
  symbol,
}) => {
  const { placeMarketOrder } = useMarketOrderPlacement();

  const handleBuy = async () => {
    try {
      await placeMarketOrder("BUY", symbol, risk, atrValue, ratio);
      alert("Ордер на покупку успешно размещен");
    } catch (error) {
      const errorMessage = error.message || "Неизвестная ошибка";
      alert(`Ошибка при размещении ордера: ${errorMessage}`);
      console.error("Ошибка размещения ордера:", error);
    }
  };

  const handleSell = async () => {
    try {
      await placeMarketOrder("SELL", symbol, risk, atrValue, ratio);
      alert("Ордер на продажу успешно размещен");
    } catch (error) {
      const errorMessage = error.message || "Неизвестная ошибка";
      alert(`Ошибка при размещении ордера: ${errorMessage}`);
      console.error("Ошибка размещения ордера:", error);
    }
  };

  return (
    <>
      <RiskInput risk={risk} onRiskChange={setRisk} />
      <RatioSelector value={ratio} onChange={setRatio} />
      <ATRSlider value={atrValue} onChange={setAtrValue} />
      <BuyButton onClick={handleBuy} />
      <SellButton onClick={handleSell} />
    </>
  );
};

