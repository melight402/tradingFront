import React, { useRef, useCallback, useMemo } from "react";
import { SocketProvider } from "./contexts/SocketContext";
import { ChartDataProvider } from "./contexts/ChartDataContext";
import { ChartStateProvider } from "./contexts/ChartStateContext";
import { TradingStateProvider } from "./contexts/TradingStateProvider";
import { useTradingStateContext } from "./contexts/TradingStateContext";
import { useLineToolsUpdate } from "./hooks/useLineToolsUpdate";
import { useDeleteToolsHandlers } from "./hooks/useDeleteToolsHandlers";
import { useDeleteKeyHandler } from "./hooks/useDeleteKeyHandler";
import { TopChartControls } from "./components/app/TopChartControls";
import { TopChartRightControls } from "./components/app/TopChartRightControls";
import { ChartLayout } from "./components/app/ChartLayout";
import SymbolsSidebar from "./components/sidebar/SymbolsSidebar";
import "./styles/styles.css";
import { BINANCE_FUTURES_STEP_SIZES } from "./constants/binanceStepSizes";

if (typeof window !== 'undefined') {
  window.__BINANCE_STEP_SIZES = BINANCE_FUTURES_STEP_SIZES;
}

const AppContent = ({ chart5mRef, chart1hRef, chart1dRef, handleChart5mReady, handleChart1hReady, handleChart1dReady }) => {
  const { symbol, drawingTool, setDrawingTool } = useTradingStateContext();

  useLineToolsUpdate(chart5mRef, chart1hRef, chart1dRef, symbol);

  const deleteToolsHandlers = useDeleteToolsHandlers(chart5mRef, chart1hRef, chart1dRef, symbol);
  useDeleteKeyHandler(deleteToolsHandlers.onDeleteSelected);

  const topChartFirstRow = useMemo(() => (
    <TopChartControls
      chart5mRef={chart5mRef}
      chart1hRef={chart1hRef}
      chart1dRef={chart1dRef}
      deleteToolsHandlers={deleteToolsHandlers}
    />
  ), [chart5mRef, chart1hRef, chart1dRef, deleteToolsHandlers]);

  const topChartSecondRowRight = useMemo(() => (
    <TopChartRightControls
      chart5mRef={chart5mRef}
      chart1hRef={chart1hRef}
      chart1dRef={chart1dRef}
    />
  ), [chart5mRef, chart1hRef, chart1dRef]);

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

      <SymbolsSidebar />
      </div>
    </ChartDataProvider>
  );
};

const App = () => {
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

  return (
    <SocketProvider>
      <ChartStateProvider>
        <TradingStateProvider>
          <AppContent
            chart5mRef={chart5mRef}
            chart1hRef={chart1hRef}
            chart1dRef={chart1dRef}
            handleChart5mReady={handleChart5mReady}
            handleChart1hReady={handleChart1hReady}
            handleChart1dReady={handleChart1dReady}
          />
        </TradingStateProvider>
      </ChartStateProvider>
    </SocketProvider>
  );
};

export default App;
