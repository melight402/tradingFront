import React from "react";
import { usePositionClose } from "../../hooks/usePositionClose";
import "../../styles/styles.css";

const ClosePositionButton = ({ 
  chart5mRef, 
  chart1hRef, 
  chart1dRef, 
  symbol, 
  profitLoss,
}) => {
  const { closePositionWithData, isClosing } = usePositionClose(chart5mRef, chart1hRef, chart1dRef, symbol);

  const handleClose = () => {
    closePositionWithData(profitLoss);
  };

  return (
    <button
      className="export-button"
      onClick={handleClose}
      disabled={isClosing}
    >
      {isClosing ? "Закрытие..." : "Закрыть позицию"}
    </button>
  );
};

export default ClosePositionButton;
