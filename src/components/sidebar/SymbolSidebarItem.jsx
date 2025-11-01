import React from "react";
import { formatVolume, formatPriceChange } from "../../utils";
import { COLORS } from "../../constants";
import { createPriceChangeStyle } from "../../styles/styles";

const SymbolSidebarItem = ({ symbol, isSelected, onSelect, itemRef, onFocus }) => {
  return (
    <div
      ref={isSelected ? itemRef : null}
      className={isSelected ? "symbols-sidebar-item symbols-sidebar-item-selected" : "symbols-sidebar-item"}
      onClick={() => {
        onSelect(symbol.value);
        if (onFocus) {
          onFocus();
        }
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = COLORS.background.secondary;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      <div className="symbols-sidebar-symbol-name">{symbol.label}</div>
      <div className="symbols-sidebar-volume">Объем: ${formatVolume(symbol.volume)}</div>
      <div style={createPriceChangeStyle(symbol.priceChangePercent >= 0)}>
        {formatPriceChange(symbol.priceChangePercent)}
      </div>
    </div>
  );
};

export default SymbolSidebarItem;

