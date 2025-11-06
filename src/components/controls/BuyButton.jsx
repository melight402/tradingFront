import React from "react";
import { createButtonHoverHandlers } from "../../utils";

const BuyButton = ({ onClick }) => {
  const buttonHandlers = createButtonHoverHandlers("primary");

  return (
    <button
      onClick={onClick}
      style={{
        ...buttonHandlers.style,
        backgroundColor: "#26a69a",
        minWidth: "100px",
      }}
      onMouseEnter={buttonHandlers.onMouseEnter}
      onMouseLeave={buttonHandlers.onMouseLeave}
    >
      Buy
    </button>
  );
};

export default BuyButton;

