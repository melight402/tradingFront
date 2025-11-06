import { useEffect } from "react";

export const useDeleteKeyHandler = (onDeleteSelected) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const target = e.target;
        const isInputElement = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
        
        if (isInputElement) {
          return;
        }

        e.preventDefault();
        if (onDeleteSelected) {
          onDeleteSelected();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onDeleteSelected]);
};
