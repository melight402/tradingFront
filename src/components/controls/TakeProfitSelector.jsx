import React from "react";
import { createSelectStyle, createLabelStyle, createContainerStyle } from "../../utils";
import { TAKE_PROFIT_OPTIONS } from "../../constants";

const TakeProfitSelector = ({ value, onChange }) => {
  const selectStyle = createSelectStyle("120px");
  const labelStyle = createLabelStyle();
  const containerStyle = createContainerStyle();

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>Take Profit:</label>
      <select
        value={value || "3"}
        onChange={(e) => onChange(e.target.value)}
        style={selectStyle}
      >
        {TAKE_PROFIT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TakeProfitSelector;
