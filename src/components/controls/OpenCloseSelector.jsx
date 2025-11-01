import React from "react";
import { createSelectStyle, createLabelStyle, createContainerStyle } from "../../utils";

const OpenCloseSelector = ({ value, onChange }) => {
  const selectStyle = createSelectStyle("120px");
  const labelStyle = createLabelStyle();
  const containerStyle = createContainerStyle();

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>Действие:</label>
      <select
        value={value || "open"}
        onChange={(e) => onChange(e.target.value)}
        style={selectStyle}
      >
        <option value="open">Открытие</option>
        <option value="close">Закрытие</option>
      </select>
    </div>
  );
};

export default OpenCloseSelector;

