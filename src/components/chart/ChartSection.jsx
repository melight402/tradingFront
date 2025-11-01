import React, { useState, useMemo } from "react";
import ChartControls from "../controls/ChartControls";
import { PriceChart } from "./PriceChart";
import { useChartData } from "../../contexts/ChartDataContext";
import "../../styles/styles.css";

const ChartSection = ({ symbol, initialInterval = "1h", drawingTool = null, onChartReady = null, onDrawingToolDeactivate = null, firstRowContent = null, secondRowCenter = null, secondRowRight = null, volumeAreaHeight = 0.07, limit = 500, chartKey = "chart1h" }) => {
  const [interval, setInterval] = useState(initialInterval);
  const containerRef = React.useRef(null);
  const controlsRef = React.useRef(null);
  const [chartHeight, setChartHeight] = React.useState(400);
  
  const { data } = useChartData(chartKey, symbol, interval, limit);
  const lastCandle = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }
    return data[data.length - 1];
  }, [data]);

  React.useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current && controlsRef.current) {
        const controlsHeight = controlsRef.current.offsetHeight || 50;
        const marginBottom = 0;
        const availableHeight = containerRef.current.clientHeight - controlsHeight - marginBottom;
        setChartHeight(Math.max(200, availableHeight));
      }
    };

    const timeoutId = setTimeout(updateHeight, 0);
    
    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    const controlsObserver = new ResizeObserver(updateHeight);
    const controlsElement = controlsRef.current;
    if (controlsElement) {
      controlsObserver.observe(controlsElement);
    }
    
    window.addEventListener("resize", updateHeight);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      if (controlsElement) {
        controlsObserver.disconnect();
      }
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <div ref={containerRef} className="chart-section-container">
      <div ref={controlsRef} className="chart-section-controls">
        <ChartControls
          interval={interval}
          onIntervalChange={setInterval}
          firstRowContent={firstRowContent}
          secondRowCenter={secondRowCenter}
          secondRowRight={secondRowRight}
          symbol={symbol}
          lastCandle={lastCandle}
        />
      </div>
      <div className="chart-section-chart-wrapper">
        <PriceChart symbol={symbol} interval={interval} height={chartHeight} drawingTool={drawingTool} onChartReady={onChartReady} onDrawingToolDeactivate={onDrawingToolDeactivate} volumeAreaHeight={volumeAreaHeight} limit={limit} chartKey={chartKey} />
      </div>
    </div>
  );
};

export default ChartSection;

