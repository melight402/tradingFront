import React from "react";
import { formatPrice } from "../../utils/formatters";
import "../../styles/styles.css";

const CandlePopup = ({ popupState }) => {
  const hasData = popupState.open !== 0 || popupState.high !== 0 || popupState.low !== 0 || popupState.close !== 0;

  return (
    <div className={`candle-info-panel ${hasData ? 'candle-info-panel-visible' : ''}`}>
      <span className="candle-info-panel-high">
        High: <span className="candle-info-panel-value">{formatPrice(popupState.high)}</span>
      </span>
      <span className="candle-info-panel-open">
        Open: <span className="candle-info-panel-value">{formatPrice(popupState.open)}</span>
      </span>
      <span className="candle-info-panel-close">
        Close: <span className="candle-info-panel-value">{formatPrice(popupState.close)}</span>
      </span>
      <span className="candle-info-panel-low">
        Low: <span className="candle-info-panel-value">{formatPrice(popupState.low)}</span>
      </span>
    </div>
  );
};

export default CandlePopup;
