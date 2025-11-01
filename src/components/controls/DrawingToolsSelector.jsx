import React from "react";
import { DRAWING_TOOLS_WITHOUT_NONE } from "../../constants";
import { COLORS } from "../../constants";

const DrawingToolsSelector = ({ drawingTool, onDrawingToolChange }) => {
  const containerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  };

  const buttonStyle = (isActive) => ({
    width: "40px",
    height: "40px",
    backgroundColor: isActive ? COLORS.button.primary : COLORS.background.secondary,
    border: `1px solid ${isActive ? COLORS.button.primaryHover : COLORS.border.primary}`,
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    transition: "all 0.2s",
    outline: "none",
    userSelect: "none",
    color: COLORS.text.primary,
  });

  const handleButtonClick = (toolValue) => {
    if (drawingTool === toolValue) {
      onDrawingToolChange(null);
    } else {
      onDrawingToolChange(toolValue);
    }
  };

  const handleMouseEnter = (e, isActive) => {
    if (!isActive) {
      e.target.style.backgroundColor = COLORS.background.hover || COLORS.background.tertiary;
    } else {
      e.target.style.backgroundColor = COLORS.button.primaryHover;
    }
  };

  const handleMouseLeave = (e, isActive) => {
    e.target.style.backgroundColor = isActive ? COLORS.button.primary : COLORS.background.secondary;
  };

  const renderIcon = (tool) => {
    if (tool.value === "HorizontalLine") {
      return (
        <div
          style={{
            width: "20px",
            height: "2px",
            backgroundColor: COLORS.text.primary,
            borderRadius: "1px",
          }}
        />
      );
    }
    return tool.icon;
  };

  return (
    <div style={containerStyle}>
      {DRAWING_TOOLS_WITHOUT_NONE.map((tool) => {
        const isActive = drawingTool === tool.value;
        return (
          <button
            key={tool.value}
            onClick={() => handleButtonClick(tool.value)}
            onMouseEnter={(e) => handleMouseEnter(e, isActive)}
            onMouseLeave={(e) => handleMouseLeave(e, isActive)}
            style={buttonStyle(isActive)}
            title={tool.label}
            type="button"
          >
            {renderIcon(tool)}
          </button>
        );
      })}
    </div>
  );
};

export default DrawingToolsSelector;

