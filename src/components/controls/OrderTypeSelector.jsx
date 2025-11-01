import React from "react";
import { ORDER_TYPES } from "../../constants";
import { createSelectStyle, createLabelStyle, createContainerStyle } from "../../utils";

const OrderTypeSelector = ({ orderType, onOrderTypeChange }) => {
  const selectStyle = createSelectStyle("200px");
  const labelStyle = createLabelStyle();
  const containerStyle = createContainerStyle();

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>Тип ордера:</label>
      <select
        value={orderType || "MARKET"}
        onChange={(e) => onOrderTypeChange(e.target.value)}
        style={selectStyle}
      >
        {ORDER_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OrderTypeSelector;

