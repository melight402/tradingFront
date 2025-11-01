import React, { useState, useEffect } from "react";
import { createInputStyle, createLabelStyle, createContainerStyle } from "../../utils";

const StopPriceInput = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value ? value.toString() : "");

  useEffect(() => {
    setLocalValue(value ? value.toString() : "");
  }, [value]);

  const handleChange = (e) => {
    const inputValue = e.target.value.replace(/[^0-9.]/g, "");
    setLocalValue(inputValue);
    
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue >= 0) {
      onChange(numValue);
    } else if (inputValue === "") {
      onChange(null);
    }
  };

  const handleBlur = () => {
    const numValue = parseFloat(localValue);
    if (isNaN(numValue) || numValue < 0) {
      setLocalValue("");
      onChange(null);
    } else {
      setLocalValue(numValue.toString());
      onChange(numValue);
    }
  };

  const inputStyle = createInputStyle("120px");
  const labelStyle = createLabelStyle();
  const containerStyle = createContainerStyle();

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>Стоп цена:</label>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="0.00"
        style={inputStyle}
        inputMode="decimal"
      />
    </div>
  );
};

export default StopPriceInput;

