import React from "react";
import { createSelectStyle, createLabelStyle, createContainerStyle } from "../../utils";
import { TVX_OPTIONS } from "../../constants";

const TVXSelector = ({ tvxValue, onTVXChange }) => {
  const selectStyle = createSelectStyle("180px");
  const labelStyle = createLabelStyle();
  const containerStyle = createContainerStyle();

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>ТВХ:</label>
      <select
        value={tvxValue || "level_breakout"}
        onChange={(e) => onTVXChange(e.target.value)}
        style={selectStyle}
      >
        {TVX_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TVXSelector;

