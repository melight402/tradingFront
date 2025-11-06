import React, { useState, useEffect } from "react";
import { createLabelStyle, createContainerStyle } from "../../utils";

const ATR_VALUES = [0.01, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 3, 5, 6, 7.5, 10, 13, 15, 18, 20, 23, 25, 50, 75, 100, 500, 1000, 5000];

const ATRSlider = ({ value, onChange }) => {
  const [index, setIndex] = useState(() => {
    const initialIndex = ATR_VALUES.findIndex(v => v === value);
    return initialIndex >= 0 ? initialIndex : 0;
  });

  useEffect(() => {
    const currentIndex = ATR_VALUES.findIndex(v => v === value);
    if (currentIndex >= 0 && currentIndex !== index) {
      setIndex(currentIndex);
    }
  }, [value, index]);

  const handleChange = (e) => {
    const newIndex = parseInt(e.target.value, 10);
    setIndex(newIndex);
    onChange(ATR_VALUES[newIndex]);
  };

  const labelStyle = createLabelStyle();
  const containerStyle = createContainerStyle();

  const sliderStyle = {
    width: "200px",
    height: "6px",
    borderRadius: "3px",
    outline: "none",
    appearance: "none",
    backgroundColor: "#383E55",
  };

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>ATR:</label>
      <input
        type="range"
        min="0"
        max={ATR_VALUES.length - 1}
        value={index}
        onChange={handleChange}
        style={sliderStyle}
      />
      <span style={{ color: "#FFFFFF", fontSize: "14px", marginLeft: "0px", minWidth: "10px" }}>
        {ATR_VALUES[index]}
      </span>
    </div>
  );
};

export default ATRSlider;

