import { useCallback } from "react";

export const useChartDataValidator = () => {
  const validateCandleData = useCallback((data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return false;
    }

    return data.every(d => 
      d && typeof d.time === 'number' && isFinite(d.time) &&
      typeof d.open === 'number' && isFinite(d.open) &&
      typeof d.high === 'number' && isFinite(d.high) &&
      typeof d.low === 'number' && isFinite(d.low) &&
      typeof d.close === 'number' && isFinite(d.close)
    );
  }, []);

  const validateVolumeData = useCallback((data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return false;
    }

    return data.every(d => 
      d && typeof d.time === 'number' && isFinite(d.time) &&
      typeof d.value === 'number' && isFinite(d.value)
    );
  }, []);

  return { validateCandleData, validateVolumeData };
};
