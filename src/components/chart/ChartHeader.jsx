import React, { useEffect } from "react";
import { INTERVALS } from "../../constants";
import { createSelectStyle, createLabelStyle } from "../../utils";
import { useSocketContext, useTimeAndSalesData } from "../../contexts/SocketContext";
import { formatVolume } from "../../utils/formatters";
import "../../styles/styles.css";

const ChartHeader = ({ 
  interval, 
  onIntervalChange, 
  firstRowContent, 
  secondRowCenter, 
  secondRowRight, 
  symbol, 
  lastCandle, 
  collapseButtonProps,
  chartKey 
}) => {
  const selectStyle = createSelectStyle("150px");
  const labelStyle = createLabelStyle();
  const { subscribeToTape, updateLastCandleForTape } = useSocketContext();
  
  const tapeKey = `${chartKey}-${symbol}-${interval}`;
  const { buySum, sellSum, loading } = useTimeAndSalesData(tapeKey, symbol, interval);

  useEffect(() => {
    if (!lastCandle || !lastCandle.date) {
      return;
    }

    if (chartKey === "chart5m") {
      console.log(`[Tape Debug] chart5m subscribing: symbol=${symbol}, interval=${interval}, tapeKey=${tapeKey}`);
    }

    const unsubscribe = subscribeToTape(tapeKey, symbol, interval, lastCandle);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [symbol, interval, lastCandle, tapeKey, subscribeToTape]);

  useEffect(() => {
    if (lastCandle && lastCandle.date) {
      updateLastCandleForTape(tapeKey, symbol, interval, lastCandle);
    }
  }, [symbol, interval, lastCandle, tapeKey, updateLastCandleForTape]);

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
          <div className="time-sales-summary">
            <span className="time-sales-label">Лента:</span>
            {loading ? (
              <span className="time-sales-value">Загрузка...</span>
            ) : (
              <>
                <span className="time-sales-buy">Покупка: {formatVolume(buySum)}</span>
                <span className="time-sales-separator">|</span>
                <span className="time-sales-sell">Продажа: {formatVolume(sellSum)}</span>
              </>
            )}
          </div>
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

export default ChartHeader;

