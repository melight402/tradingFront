import React, { useRef, useCallback, useMemo } from "react";
import { ChartDataProvider } from "./contexts/ChartDataContext";
import { useTradingState } from "./hooks/useTradingState";
import { useLineToolsUpdate } from "./hooks/useLineToolsUpdate";
import { useDeleteToolsHandlers } from "./hooks/useDeleteToolsHandlers";
import { TopChartControls } from "./components/app/TopChartControls";
import { TopChartRightControls } from "./components/app/TopChartRightControls";
import { ChartLayout } from "./components/app/ChartLayout";
import SymbolsSidebar from "./components/sidebar/SymbolsSidebar";
import "./styles/styles.css";
import { BINANCE_FUTURES_STEP_SIZES } from "./constants/binanceStepSizes";

if (typeof window !== 'undefined') {
  window.__BINANCE_STEP_SIZES = BINANCE_FUTURES_STEP_SIZES;
}

const App = () => {
  const tradingState = useTradingState();
  const {
    symbol,
    drawingTool,
    setDrawingTool,
    risk,
    orderType,
    setOrderType,
    tvxValue,
    setTVXValue,
    openClose,
    setOpenClose,
    stopPrice,
    setStopPrice,
    purchasePrice,
    setPurchasePrice,
    manualStopLoss,
    setManualStopLoss,
    profitLoss,
    setProfitLoss,
  } = tradingState;

  const chart5mRef = useRef(null);
  const chart1hRef = useRef(null);
  const chart1dRef = useRef(null);

  const handleChart5mReady = useCallback((chart) => {
    chart5mRef.current = chart;
  }, []);

  const handleChart1hReady = useCallback((chart) => {
    chart1hRef.current = chart;
  }, []);

  const handleChart1dReady = useCallback((chart) => {
    chart1dRef.current = chart;
  }, []);

  useLineToolsUpdate(chart5mRef, chart1hRef, chart1dRef, symbol, risk);

  const deleteToolsHandlers = useDeleteToolsHandlers(chart5mRef, chart1hRef, chart1dRef, symbol);

  const topChartFirstRow = useMemo(() => (
    <TopChartControls
      openClose={openClose}
      setOpenClose={setOpenClose}
      orderType={orderType}
      setOrderType={setOrderType}
      tvxValue={tvxValue}
      setTVXValue={setTVXValue}
      drawingTool={drawingTool}
      setDrawingTool={setDrawingTool}
      stopPrice={stopPrice}
      setStopPrice={setStopPrice}
      purchasePrice={purchasePrice}
      setPurchasePrice={setPurchasePrice}
      manualStopLoss={manualStopLoss}
      setManualStopLoss={setManualStopLoss}
      deleteToolsHandlers={deleteToolsHandlers}
    />
  ), [drawingTool, orderType, openClose, stopPrice, purchasePrice, manualStopLoss, tvxValue, deleteToolsHandlers]);

  const topChartSecondRowRight = useMemo(() => (
    <TopChartRightControls
      risk={risk}
      setRisk={tradingState.setRisk}
      profitLoss={profitLoss}
      setProfitLoss={setProfitLoss}
      chart5mRef={chart5mRef}
      chart1hRef={chart1hRef}
      chart1dRef={chart1dRef}
      symbol={symbol}
      openClose={openClose}
      orderType={orderType}
      tvxValue={tvxValue}
      stopPrice={stopPrice}
      purchasePrice={purchasePrice}
      manualStopLoss={manualStopLoss}
    />
  ), [symbol, openClose, orderType, tvxValue, risk, stopPrice, purchasePrice, manualStopLoss, profitLoss, tradingState.setRisk]);

  return (
    <ChartDataProvider>
      <div className="app-container">
        <ChartLayout
          symbol={symbol}
          drawingTool={drawingTool}
          setDrawingTool={setDrawingTool}
          handleChart5mReady={handleChart5mReady}
          handleChart1hReady={handleChart1hReady}
          handleChart1dReady={handleChart1dReady}
          topChartFirstRow={topChartFirstRow}
          topChartSecondRowCenter={null}
          topChartSecondRowRight={topChartSecondRowRight}
        />

        <SymbolsSidebar 
          selectedSymbol={symbol}
          onSymbolSelect={tradingState.setSymbol}
        />
      </div>
    </ChartDataProvider>
  );
};

export default App;
