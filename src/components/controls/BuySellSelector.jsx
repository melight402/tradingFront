import React from "react";
import { createSelectStyle, createLabelStyle, createContainerStyle } from "../../utils";

const BuySellSelector = ({ value, onChange }) => {
  const selectStyle = createSelectStyle("120px");
  const labelStyle = createLabelStyle();
  const containerStyle = createContainerStyle();

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>Направление:</label>
      <select
        value={value || "BUY"}
        onChange={(e) => onChange(e.target.value)}
        style={selectStyle}
      >
        <option value="BUY">Покупка</option>
        <option value="SELL">Продажа</option>
      </select>
    </div>
  );
};

export default BuySellSelector;

