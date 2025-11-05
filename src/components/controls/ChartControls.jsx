import React from "react";
import { INTERVALS } from "../../constants";
import { createSelectStyle, createLabelStyle } from "../../utils";
import TimeAndSalesSummary from "./TimeAndSalesSummary";
import "../../styles/styles.css";

const ChartControls = ({ interval, onIntervalChange, firstRowContent, secondRowCenter, secondRowRight, symbol, lastCandle, collapseButtonProps }) => {
  const selectStyle = createSelectStyle("150px");
  const labelStyle = createLabelStyle();

  return (
    <div className="chart-controls-container">
      {collapseButtonProps && (
        <button 
          className="bottom-charts-collapse-button-header"
          onClick={collapseButtonProps.toggleCollapse}
          title={collapseButtonProps.isCollapsed ? "Развернуть графики" : "Схлопнуть графики"}
        >
          {collapseButtonProps.isCollapsed ? "▲" : "▼"}
        </button>
      )}
      {firstRowContent && (
        <div className="chart-controls-row chart-controls-row-first">
          {firstRowContent}
        </div>
      )}
      <div className="chart-controls-row chart-controls-row-second">
        <div className="chart-controls-second-row-left">
          <div className="chart-controls-label-container">
            <label style={labelStyle}>Таймфрейм:</label>
            <select
              value={interval}
              onChange={(e) => onIntervalChange(e.target.value)}
              style={selectStyle}
            >
              {INTERVALS.map((int) => (
                <option key={int.value} value={int.value}>
                  {int.label}
                </option>
              ))}
            </select>
          </div>
          <TimeAndSalesSummary symbol={symbol} interval={interval} lastCandle={lastCandle} />
        </div>
          {secondRowCenter && (
            <div className="chart-controls-second-row-center">
              {secondRowCenter}
            </div>
          )}
        {secondRowRight && (
          <div className="chart-controls-second-row-right">
            {secondRowRight}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartControls;

