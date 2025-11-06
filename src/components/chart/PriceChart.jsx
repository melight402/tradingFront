import React, { useEffect, useRef } from "react";
import { useChartData } from "../../contexts/ChartDataContext";
import { persistLineToolsFromChart } from "../../services/lineToolsManager";
import { saveChartState } from "../../services/chartStateStorage";
import { useChartInitialization } from "../../hooks/useChartInitialization";
import { useChartPopup } from "../../hooks/useChartPopup";
import { useChartDataUpdates } from "../../hooks/useChartDataUpdates";
import { useChartLineTools } from "../../hooks/useChartLineTools";
import { useChartDataSync } from "../../hooks/useChartDataSync";
import { useChartStateAutoSave } from "../../hooks/useChartStateAutoSave";
import { addRightPadding } from "../../utils/chartHelpers";
import CandlePopup from "./CandlePopup";
import "../../styles/styles.css";

const PriceChart = ({ height = 900, symbol = "BTCUSDT", interval = "1h", drawingTool = null, onChartReady = null, onDrawingToolDeactivate = null, volumeAreaHeight = 0.07, limit = 500, chartKey = "chart1h" }) => {
  const chartContainerRef = useRef();
  const chart = useRef();
  const candlestickSeries = useRef();
  const volumeSeries = useRef();
  const volumeDataRef = useRef([]);
  const isInitialRender = useRef(true);
  const lastCandleTimeRef = useRef(null);
  const currentSymbolRef = useRef(symbol);
  const currentIntervalRef = useRef(interval);
  const prevSymbolRef = useRef(symbol);
  const prevIntervalRef = useRef(interval);
  const onChartReadyRef = useRef(onChartReady);
  const drawingToolRef = useRef(drawingTool);
  const isRestoringStateRef = useRef(false);
  const isUpdatingDataRef = useRef(false);
  
  const { data, loaded, error, setOnLastCandleUpdate } = useChartData(chartKey, symbol, interval, limit);

  const { popupState, setPopupState } = useChartPopup(chart, candlestickSeries, loaded, drawingToolRef);

  const { updateLastCandle, updateChartData, dataUpdateTimeoutRef } = useChartDataUpdates(
    chart,
    candlestickSeries,
    volumeSeries,
    volumeDataRef,
    isInitialRender,
    lastCandleTimeRef,
    currentSymbolRef,
    currentIntervalRef,
    isUpdatingDataRef,
    volumeAreaHeight,
    isRestoringStateRef,
    chartKey
  );

  const { restoreLineTools } = useChartLineTools(
    chart,
    candlestickSeries,
    volumeSeries,
    symbol,
    interval,
    prevSymbolRef,
    prevIntervalRef,
    currentSymbolRef,
    currentIntervalRef,
    isInitialRender,
    drawingTool,
    drawingToolRef,
    isRestoringStateRef,
    setPopupState,
    onDrawingToolDeactivate
  );

  useChartInitialization(
    chartContainerRef,
    chart,
    candlestickSeries,
    volumeSeries,
    volumeDataRef,
    height,
    volumeAreaHeight,
    onChartReadyRef,
    isRestoringStateRef,
    currentSymbolRef,
    currentIntervalRef,
    chartKey
  );

  React.useEffect(() => {
    onChartReadyRef.current = onChartReady;
  }, [onChartReady]);

  React.useEffect(() => {
    drawingToolRef.current = drawingTool;
  }, [drawingTool]);

  useEffect(() => {
    if (chart.current && chartContainerRef.current) {
      chart.current.applyOptions({
        height: height,
      });
    }
  }, [height]);

  useChartDataSync(
    chart,
    candlestickSeries,
    volumeSeries,
    data,
    loaded,
    symbol,
    interval,
    currentSymbolRef,
    currentIntervalRef,
    dataUpdateTimeoutRef,
    updateChartData,
    restoreLineTools,
    setOnLastCandleUpdate,
    updateLastCandle
  );

  useChartStateAutoSave(
    chart,
    candlestickSeries,
    currentSymbolRef,
    currentIntervalRef,
    isRestoringStateRef,
    chartKey
  );

  useEffect(() => {
    if (!chart.current || !candlestickSeries.current || !loaded) return;
    if (isRestoringStateRef.current) return;
    if (isInitialRender.current) return;
    
    const chartInstance = chart.current;
    const timeScale = chartInstance.timeScale();
    if (!timeScale) return;
    
    let paddingTimeout;
    let isUserInteraction = false;
    let lastInteractionTime = 0;
    
    const handler = () => {
      if (isRestoringStateRef.current) return;
      if (isInitialRender.current) return;
      if (isUpdatingDataRef.current) return;
      
      const now = Date.now();
      if (now - lastInteractionTime < 500) {
        isUserInteraction = true;
      } else {
        isUserInteraction = false;
      }
      
      if (!isUserInteraction) {
        return;
      }
      
      if (paddingTimeout) {
        clearTimeout(paddingTimeout);
      }
      
      paddingTimeout = setTimeout(() => {
        if (chart.current && candlestickSeries.current && !isRestoringStateRef.current && !isInitialRender.current && !isUpdatingDataRef.current) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (chart.current && candlestickSeries.current && !isRestoringStateRef.current && !isInitialRender.current && !isUpdatingDataRef.current) {
                addRightPadding(chart.current, candlestickSeries.current, 100);
              }
            });
          });
        }
      }, 300);
    };
    
    const handleUserInteraction = () => {
      lastInteractionTime = Date.now();
      isUserInteraction = true;
    };
    
    timeScale.subscribeVisibleTimeRangeChange(handler);
    
    if (chartContainerRef.current) {
      chartContainerRef.current.addEventListener('mousedown', handleUserInteraction);
      chartContainerRef.current.addEventListener('wheel', handleUserInteraction);
    }
    
    return () => {
      if (paddingTimeout) {
        clearTimeout(paddingTimeout);
      }
      if (chartInstance && timeScale) {
        timeScale.unsubscribeVisibleTimeRangeChange(handler);
      }
      if (chartContainerRef.current) {
        chartContainerRef.current.removeEventListener('mousedown', handleUserInteraction);
        chartContainerRef.current.removeEventListener('wheel', handleUserInteraction);
      }
    };
  }, [chart, candlestickSeries, loaded, isRestoringStateRef, isInitialRender, isUpdatingDataRef]);

  const handleContainerContextMenu = (e) => {
      e.preventDefault();
    if (chart.current && currentSymbolRef.current && currentIntervalRef.current) {
      persistLineToolsFromChart(chart.current, currentSymbolRef.current);
      
      try {
        const timeScale = chart.current.timeScale();
        const priceScale = chart.current.priceScale('right');
        
        const state = {};
        
        if (timeScale) {
          const logicalRange = timeScale.getVisibleLogicalRange();
          const timeRange = timeScale.getVisibleRange();
          
          if (logicalRange && typeof logicalRange.from === 'number' && typeof logicalRange.to === 'number' && 
              !isNaN(logicalRange.from) && !isNaN(logicalRange.to)) {
            state.logicalRange = logicalRange;
          }
          if (timeRange && timeRange.from != null && timeRange.to != null) {
            state.timeRange = timeRange;
          }
        }
        
        if (priceScale && candlestickSeries.current) {
          try {
            const priceScaleOptions = priceScale.options();
            state.priceScale = {
              autoScale: priceScaleOptions?.autoScale ?? true,
              scaleMargins: priceScaleOptions?.scaleMargins
            };
            
            try {
              const visibleRange = priceScale.getVisibleRange();
              if (visibleRange && visibleRange.minValue !== null && visibleRange.maxValue !== null) {
                state.priceRange = {
                  from: visibleRange.minValue,
                  to: visibleRange.maxValue
                };
              }
            } catch {
              void 0;
            }
          } catch {
            void 0;
          }
        }
        
        if (state.logicalRange || state.timeRange || state.priceScale || state.priceRange) {
          saveChartState(chartKey, currentSymbolRef.current, currentIntervalRef.current, state);
        }
      } catch {
        void 0;
      }
    }
  };

  return (
    <div
      ref={chartContainerRef}
      onContextMenu={handleContainerContextMenu}
      className="chart-container"
      style={{
        height: height,
        minHeight: height,
      }}
    >
      {error && (
        <div className="chart-error">
          Error loading data: {error}
        </div>
      )}
      <CandlePopup popupState={popupState} />
    </div>
  );
};

export { PriceChart };
