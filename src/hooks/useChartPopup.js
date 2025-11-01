import { useState, useRef, useEffect } from "react";

export const useChartPopup = (chart, candlestickSeries, loaded, drawingToolRef) => {
  const [popupState, setPopupState] = useState({
    visible: false,
    x: 0,
    y: 0,
    open: 0,
    high: 0,
    low: 0,
    close: 0,
  });
  
  const isDraggingRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const clickHandlerRef = useRef(null);

  useEffect(() => {
    if (!chart.current || !candlestickSeries.current) return;

    const handleClick = (param) => {
      try {
        if (isDraggingRef.current || !param || !param.point) {
          return;
        }

        if (drawingToolRef?.current) {
          return;
        }

        if (!chart.current || !candlestickSeries.current) {
          return;
        }

        if (!param.seriesPrices || !(param.seriesPrices instanceof Map)) {
          return;
        }

        const currentSeries = candlestickSeries.current;
        if (!currentSeries) {
          return;
        }

        const candlestickData = param.seriesPrices.get(currentSeries);
        
        if (!candlestickData || typeof candlestickData !== 'object') {
          return;
        }

        const hasCandleFields = 'open' in candlestickData || 'high' in candlestickData || 
                                'low' in candlestickData || 'close' in candlestickData;
        
        if (!hasCandleFields) {
          return;
        }

        const open = typeof candlestickData.open === 'number' ? candlestickData.open : null;
        const high = typeof candlestickData.high === 'number' ? candlestickData.high : null;
        const low = typeof candlestickData.low === 'number' ? candlestickData.low : null;
        const close = typeof candlestickData.close === 'number' ? candlestickData.close : null;

        if (open === null && high === null && low === null && close === null) {
          return;
        }

        const popupX = param.point.x;
        const popupY = Math.max(10, param.point.y - 300);
        
        setPopupState({
          visible: true,
          x: popupX,
          y: popupY,
          open: open || 0,
          high: high || 0,
          low: low || 0,
          close: close || 0,
        });
      } catch {
        void 0;
      }
    };

    clickHandlerRef.current = handleClick;

    const timeoutId = setTimeout(() => {
      if (chart.current && candlestickSeries.current && clickHandlerRef.current) {
        try {
          chart.current.subscribeClick(clickHandlerRef.current);
        } catch {
          void 0;
        }
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (chart.current && clickHandlerRef.current) {
        try {
          chart.current.unsubscribeClick(clickHandlerRef.current);
        } catch {
          void 0;
        }
      }
      clickHandlerRef.current = null;
    };
  }, [chart, candlestickSeries, loaded, drawingToolRef]);

  useEffect(() => {
    if (!chart.current) return;

    let dragStartX = 0;
    let dragStartY = 0;
    const DRAG_THRESHOLD = 5;

    const handleMouseDown = (e) => {
      isMouseDownRef.current = true;
      isDraggingRef.current = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    };

    const handleMouseMove = (e) => {
      if (isMouseDownRef.current) {
        const deltaX = Math.abs(e.clientX - dragStartX);
        const deltaY = Math.abs(e.clientY - dragStartY);
        
        if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
          isDraggingRef.current = true;
          setPopupState(prev => ({ ...prev, visible: false }));
        }
      }
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);
    };

    const handleMouseLeave = () => {
      isMouseDownRef.current = false;
      isDraggingRef.current = false;
    };

    const container = chart.current.chartElement?.parentElement;
    if (!container) return;

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [chart]);

  const closePopup = () => {
    setPopupState(prev => ({ ...prev, visible: false }));
  };

  return { popupState, closePopup, setPopupState };
};

