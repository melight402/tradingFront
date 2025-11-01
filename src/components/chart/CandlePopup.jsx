import React from "react";
import { formatPrice } from "../../utils/formatters";
import "../../styles/styles.css";

const CandlePopup = ({ popupState, onClose }) => {
  if (!popupState.visible) {
    return null;
  }

  return (
    <div
      className="candle-popup"
      style={{
        left: `${popupState.x}px`,
        top: `${popupState.y}px`,
      }}
    >
      <div className="candle-popup-header">
        <button
          className="candle-popup-close-button"
          onClick={onClose}
          aria-label="Close popup"
        >
          ×
        </button>
      </div>
      <div className="candle-popup-high">
        High: <span className="candle-popup-value">{formatPrice(popupState.high)}</span>
      </div>
      <div className="candle-popup-open">
        Open: <span className="candle-popup-value">{formatPrice(popupState.open)}</span>
      </div>
      <div className="candle-popup-close">
        Close: <span className="candle-popup-value">{formatPrice(popupState.close)}</span>
      </div>
      <div className="candle-popup-low">
        Low: <span className="candle-popup-value">{formatPrice(popupState.low)}</span>
      </div>
    </div>
  );
};

export default CandlePopup;
