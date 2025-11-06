import React, { useState, useEffect } from "react";
import { createLabelStyle, createContainerStyle } from "../../utils";

const ATR_VALUES = [0.01, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 3, 5, 6, 7.5, 10, 13, 15, 18, 20, 23, 25, 50, 75, 100, 500, 1000, 5000];

const ATRSlider = ({ value, onChange }) => {
  const [index, setIndex] = useState(() => {
    const initialIndex = ATR_VALUES.findIndex(v => v === value);
    return initialIndex >= 0 ? initialIndex : 0;
  });

  const [isDragging, setIsDragging] = useState(false);

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

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
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

  const tooltipStyle = {
    position: "absolute",
    bottom: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    marginBottom: "8px",
    backgroundColor: "#2a2e39",
    color: "#FFFFFF",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    whiteSpace: "nowrap",
    pointerEvents: "none",
    border: "1px solid #383E55",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
    zIndex: 1000,
    opacity: isDragging ? 1 : 0,
    transition: "opacity 0.2s",
  };

  return (
    <div style={{ ...containerStyle, position: "relative" }}>
      <label style={labelStyle}>ATR:</label>
      <div style={{ position: "relative" }}>
        <input
          type="range"
          min="0"
          max={ATR_VALUES.length - 1}
          value={index}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={sliderStyle}
        />
        {isDragging && (
          <div style={tooltipStyle}>
            {ATR_VALUES[index]}
          </div>
        )}
      </div>
    </div>
  );
};

export default ATRSlider;

