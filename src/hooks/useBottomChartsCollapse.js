import { useState, useEffect } from "react";
import { saveBottomChartsCollapsed, loadBottomChartsCollapsed } from "../services/localStorageUtils";

export const useBottomChartsCollapse = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => loadBottomChartsCollapsed(false));

  useEffect(() => {
    saveBottomChartsCollapsed(isCollapsed);
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return {
    isCollapsed,
    toggleCollapse,
  };
};


