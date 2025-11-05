import React from "react";
import ChartSection from "../chart/ChartSection";
import { useBottomChartsCollapse } from "../../hooks/useBottomChartsCollapse";

export const ChartLayout = ({
  symbol,
  drawingTool,
  setDrawingTool,
  handleChart5mReady,
  handleChart1hReady,
  handleChart1dReady,
  topChartFirstRow,
  topChartSecondRowCenter,
  topChartSecondRowRight,
}) => {
  const { isCollapsed, toggleCollapse } = useBottomChartsCollapse();

  return (
    <div className="app-main-content">
      <div className="app-top-section">
        <ChartSection 
          symbol={symbol} 
          initialInterval="5m" 
          drawingTool={drawingTool} 
          onChartReady={handleChart5mReady}
          onDrawingToolDeactivate={() => setDrawingTool(null)}
          volumeAreaHeight={0.14}
          limit={1500}
          firstRowContent={topChartFirstRow}
          secondRowCenter={topChartSecondRowCenter}
          secondRowRight={topChartSecondRowRight}
          chartKey="chart5m"
          collapseButtonProps={{ isCollapsed, toggleCollapse }}
        />
      </div>

      <div className={`app-bottom-section ${isCollapsed ? 'app-bottom-section-collapsed' : ''}`}>
        <div className="app-chart-wrapper">
          <ChartSection 
            symbol={symbol} 
            initialInterval="1h" 
            drawingTool={drawingTool}
            onChartReady={handleChart1hReady}
            onDrawingToolDeactivate={() => setDrawingTool(null)}
            volumeAreaHeight={0.14}
            limit={1500}
            chartKey="chart1h"
          />
        </div>
        <div className="app-chart-wrapper">
          <ChartSection 
            symbol={symbol} 
            initialInterval="1d" 
            drawingTool={drawingTool}
            onChartReady={handleChart1dReady}
            onDrawingToolDeactivate={() => setDrawingTool(null)}
            volumeAreaHeight={0.14}
            limit={1500}
            chartKey="chart1d"
          />
        </div>
      </div>
    </div>
  );
};

