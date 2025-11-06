import React from "react";
import RiskInput from "../controls/RiskInput";
import RatioSelector from "../controls/RatioSelector";
import BuyButton from "../controls/BuyButton";
import SellButton from "../controls/SellButton";
import { useMarketOrderPlacement } from "../../hooks/useMarketOrderPlacement";
import { useHorizontalLinePrice } from "../../hooks/useHorizontalLinePrice";

export const TopChartRightControls = ({
  risk,
  setRisk,
  ratio,
  setRatio,
  symbol,
  orderType,
  chart5mRef,
  chart1hRef,
  chart1dRef,
}) => {
  const { placeMarketOrder } = useMarketOrderPlacement();
  const stopLossPrice = useHorizontalLinePrice(chart5mRef, chart1hRef, chart1dRef);

  const handleBuy = async () => {
    try {
      await placeMarketOrder("BUY", symbol, risk, stopLossPrice, ratio, orderType);
      alert("Ордер на покупку успешно размещен");
    } catch (error) {
      const errorMessage = error.message || "Неизвестная ошибка";
      alert(`Ошибка при размещении ордера: ${errorMessage}`);
      console.error("Ошибка размещения ордера:", error);
    }
  };

  const handleSell = async () => {
    try {
      await placeMarketOrder("SELL", symbol, risk, stopLossPrice, ratio, orderType);
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
      <BuyButton onClick={handleBuy} />
      <SellButton onClick={handleSell} />
    </>
  );
};

