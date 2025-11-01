import { COLORS } from "../constants";

export const createSelectStyle = (minWidth = "150px") => ({
  backgroundColor: COLORS.background.secondary,
  color: COLORS.text.primary,
  border: `1px solid ${COLORS.border.primary}`,
  borderRadius: "4px",
  padding: "8px 12px",
  fontSize: "14px",
  cursor: "pointer",
  outline: "none",
  minWidth,
});

export const createLabelStyle = () => ({
  color: COLORS.text.secondary,
  fontSize: "14px",
  marginRight: "10px",
});

export const createContainerStyle = (additionalStyles = {}) => ({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  ...additionalStyles,
});

export const createInputStyle = (width = "120px") => ({
  backgroundColor: COLORS.background.secondary,
  color: COLORS.text.primary,
  border: `1px solid ${COLORS.border.primary}`,
  borderRadius: "4px",
  padding: "8px 12px",
  fontSize: "14px",
  outline: "none",
  width,
  textAlign: "left",
});

export const createButtonStyle = (variant = "primary") => {
  const baseStyle = {
    border: variant === "danger" ? `1px solid ${COLORS.button.dangerHover}` : "none",
    borderRadius: "4px",
    padding: "8px 16px",
    fontSize: "14px",
    cursor: "pointer",
    outline: "none",
    fontWeight: "500",
    transition: "background-color 0.2s",
  };

  if (variant === "danger") {
    return {
      ...baseStyle,
      backgroundColor: COLORS.button.danger,
      color: COLORS.text.primary,
    };
  }

  return {
    ...baseStyle,
    backgroundColor: COLORS.button.primary,
    color: COLORS.text.primary,
  };
};

export const createButtonHoverHandlers = (variant = "primary") => {
  const baseStyle = createButtonStyle(variant);
  const hoverColor = variant === "danger" ? COLORS.button.dangerHover : COLORS.button.primaryHover;

  return {
    style: baseStyle,
    onMouseEnter: (e) => {
      e.target.style.backgroundColor = hoverColor;
    },
    onMouseLeave: (e) => {
      e.target.style.backgroundColor = baseStyle.backgroundColor;
    },
  };
};

export const createInfoButtonStyle = () => ({
  backgroundColor: COLORS.background.secondary,
  border: `1px solid ${COLORS.border.primary}`,
  borderRadius: "4px",
  padding: "8px 12px",
  color: COLORS.text.secondary,
  cursor: "pointer",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "40px",
  height: "38px",
  transition: "all 0.2s",
});

export const createInfoButtonHoverHandlers = () => ({
  onMouseEnter: (e) => {
    e.target.style.backgroundColor = COLORS.background.hover;
    e.target.style.color = COLORS.text.primary;
  },
  onMouseLeave: (e) => {
    e.target.style.backgroundColor = COLORS.background.secondary;
    e.target.style.color = COLORS.text.secondary;
  },
});
