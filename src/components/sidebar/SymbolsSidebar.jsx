import React, { useRef } from "react";
import { useTradingStateContext } from "../../contexts/TradingStateContext";
import { useSymbols } from "../../hooks/useSymbols";
import { useSymbolSidebarKeyboard } from "../../hooks/useSymbolSidebarKeyboard";
import { useSymbolSidebarScroll } from "../../hooks/useSymbolSidebarScroll";
import SymbolSidebarList from "./SymbolSidebarList";
import { symbolsSidebarStyle, symbolsSidebarHeaderStyle, symbolsSidebarTitleStyle } from "../../styles/styles";
import "../../styles/styles.css";

const SymbolsSidebar = () => {
  const { symbol: selectedSymbol, setSymbol: onSymbolSelect } = useTradingStateContext();
  const { symbols, loading, error } = useSymbols();
  const sidebarRef = useRef(null);
  const listRef = useRef(null);
  const selectedItemRef = useRef(null);

  useSymbolSidebarKeyboard(sidebarRef, symbols, selectedSymbol, loading, error, onSymbolSelect);
  useSymbolSidebarScroll(listRef, selectedItemRef, selectedSymbol, loading);

  const handleSidebarClick = (e) => {
    if (sidebarRef.current && sidebarRef.current.contains(e.target)) {
      sidebarRef.current.focus();
    }
  };

  const handleFocus = () => {
    if (sidebarRef.current) {
      sidebarRef.current.focus();
    }
  };

  return (
    <div 
      ref={sidebarRef}
      style={symbolsSidebarStyle}
      onClick={handleSidebarClick}
      tabIndex={0}
      className="symbols-sidebar"
    >
      <div style={symbolsSidebarHeaderStyle}>
        <h3 style={symbolsSidebarTitleStyle}>Торговые пары</h3>
      </div>
      {loading ? (
        <div className="symbols-sidebar-loading">Загрузка...</div>
      ) : error ? (
        <div className="symbols-sidebar-error">Ошибка загрузки</div>
      ) : symbols.length === 0 ? (
        <div className="symbols-sidebar-loading">Нет доступных пар</div>
      ) : (
        <SymbolSidebarList
          symbols={symbols}
          selectedSymbol={selectedSymbol}
          onSymbolSelect={onSymbolSelect}
          listRef={listRef}
          selectedItemRef={selectedItemRef}
          onFocus={handleFocus}
        />
      )}
    </div>
  );
};

export default SymbolsSidebar;
