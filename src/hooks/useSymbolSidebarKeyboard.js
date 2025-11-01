import { useEffect } from "react";

export const useSymbolSidebarKeyboard = (sidebarRef, symbols, selectedSymbol, loading, error, onSymbolSelect) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!sidebarRef.current || !sidebarRef.current.contains(document.activeElement)) {
        return;
      }

      if (loading || error || symbols.length === 0) {
        return;
      }

      const currentIndex = symbols.findIndex((sym) => sym.value === selectedSymbol);
      
      if (currentIndex === -1) {
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentIndex > 0) {
          onSymbolSelect(symbols[currentIndex - 1].value);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentIndex < symbols.length - 1) {
          onSymbolSelect(symbols[currentIndex + 1].value);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [symbols, selectedSymbol, loading, error, onSymbolSelect, sidebarRef]);
};

