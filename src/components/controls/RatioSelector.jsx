import React from "react";
import { createSelectStyle, createLabelStyle, createContainerStyle } from "../../utils";
import { RATIO_OPTIONS } from "../../constants";

const RatioSelector = ({ value, onChange }) => {
  const selectStyle = createSelectStyle("120px");
  const labelStyle = createLabelStyle();
  const containerStyle = createContainerStyle();

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>Ratio:</label>
      <select
        value={value || "2"}
        onChange={(e) => onChange(e.target.value)}
        style={selectStyle}
      >
        {RATIO_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RatioSelector;

