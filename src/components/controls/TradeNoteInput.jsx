import React from "react";
import { createInputStyle, createLabelStyle, createContainerStyle } from "../../utils";

const TradeNoteInput = ({ value, onChange }) => {
  const inputStyle = createInputStyle("200px");
  const labelStyle = createLabelStyle();
  const containerStyle = createContainerStyle();

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>Заметка:</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Описание сделки"
        style={inputStyle}
      />
    </div>
  );
};

export default TradeNoteInput;

