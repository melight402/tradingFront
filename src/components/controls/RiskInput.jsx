import React, { useState, useEffect } from "react";
import { formatRiskValue, validateRiskInput, createInputStyle, createLabelStyle, createContainerStyle } from "../../utils";

const RiskInput = ({ risk, onRiskChange }) => {
  const [localValue, setLocalValue] = useState(formatRiskValue(risk));

  useEffect(() => {
    setLocalValue(formatRiskValue(risk));
  }, [risk]);

  const handleChange = (e) => {
    const formatted = validateRiskInput(e.target.value);
    setLocalValue(formatted);
    
    const numValue = parseFloat(formatted);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 9999.99) {
      onRiskChange(numValue);
    } else if (formatted === "" || formatted === "0.") {
      setLocalValue("1.00");
      onRiskChange(1);
    }
  };

  const handleBlur = () => {
    const numValue = parseFloat(localValue);
    if (isNaN(numValue) || numValue < 0) {
      setLocalValue("1.00");
      onRiskChange(1);
    } else if (numValue > 9999.99) {
      setLocalValue("9999.99");
      onRiskChange(9999.99);
    } else {
      const formatted = numValue.toFixed(2);
      setLocalValue(formatted);
      onRiskChange(parseFloat(formatted));
    }
  };

  const inputStyle = createInputStyle("120px");
  const labelStyle = createLabelStyle();
  const containerStyle = createContainerStyle();

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>Риск (USDT):</label>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="1.00"
        style={inputStyle}
        inputMode="decimal"
      />
    </div>
  );
};

export default RiskInput;

