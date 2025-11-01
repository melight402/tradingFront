import React from "react";
import SymbolSidebarItem from "./SymbolSidebarItem";
import { symbolsSidebarListStyle } from "../../styles/styles";

const SymbolSidebarList = ({ symbols, selectedSymbol, onSymbolSelect, listRef, selectedItemRef, onFocus }) => {
  return (
    <div 
      ref={listRef}
      style={symbolsSidebarListStyle} 
      className="symbols-sidebar-scroll"
    >
      {symbols.map((sym) => (
        <SymbolSidebarItem
          key={sym.value}
          symbol={sym}
          isSelected={sym.value === selectedSymbol}
          onSelect={onSymbolSelect}
          itemRef={selectedItemRef}
          onFocus={onFocus}
        />
      ))}
    </div>
  );
};

export default SymbolSidebarList;

