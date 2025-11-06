import React from "react";
import { createButtonHoverHandlers } from "../../utils";

const SellButton = ({ onClick }) => {
  const buttonHandlers = createButtonHoverHandlers("primary");

  return (
    <button
      onClick={onClick}
      style={{
        ...buttonHandlers.style,
        backgroundColor: "#ef5350",
        minWidth: "100px",
      }}
      onMouseEnter={buttonHandlers.onMouseEnter}
      onMouseLeave={buttonHandlers.onMouseLeave}
    >
      Sell
    </button>
  );
};

export default SellButton;

