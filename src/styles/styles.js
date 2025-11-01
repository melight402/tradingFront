import { COLORS } from "../constants";

export const symbolsSidebarStyle = {
  width: "168px",
  backgroundColor: COLORS.background.tertiary,
  borderLeft: `1px solid ${COLORS.border.primary}`,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxSizing: "border-box",
  outline: "none",
};

export const symbolsSidebarHeaderStyle = {
  padding: "16px",
  borderBottom: `1px solid ${COLORS.border.primary}`,
  backgroundColor: COLORS.background.secondary,
};

export const symbolsSidebarTitleStyle = {
  color: COLORS.text.primary,
  fontSize: "16px",
  fontWeight: "600",
  margin: 0,
};

export const symbolsSidebarListStyle = {
  flex: 1,
  overflowY: "auto",
  padding: "8px 0",
};

export const createPriceChangeStyle = (isPositive) => ({
  fontSize: "16px",
  fontWeight: "500",
  color: isPositive ? COLORS.price.up : COLORS.price.down,
});
