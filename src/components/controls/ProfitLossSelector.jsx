import React from "react";
import { createSelectStyle, createLabelStyle, createContainerStyle } from "../../utils";

const ProfitLossSelector = ({ value, onChange }) => {
  const selectStyle = createSelectStyle("120px");
  const labelStyle = createLabelStyle();
  const containerStyle = createContainerStyle();

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>Прибыль или убыток:</label>
      <select
        value={value || "profit"}
        onChange={(e) => onChange(e.target.value)}
        style={selectStyle}
      >
        <option value="profit">Прибыль</option>
        <option value="loss">Убыток</option>
      </select>
    </div>
  );
};

export default ProfitLossSelector;

