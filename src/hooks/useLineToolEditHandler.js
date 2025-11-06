import { useEffect } from "react";

export const useLineToolEditHandler = (
  chart,
  drawingToolRef,
  isRestoringStateRef,
  onDrawingToolDeactivate,
  justFinishedDrawingRef
) => {
  useEffect(() => {
    if (!chart.current) return;

    const chartInstance = chart.current;

    const handleAfterEdit = (params) => {
      if (isRestoringStateRef?.current) {
        return;
      }

      const currentDrawingTool = drawingToolRef?.current;
      
      if (currentDrawingTool && (params.stage === 'lineToolFinished' || params.stage === 'pathFinished')) {
        if (justFinishedDrawingRef) {
          justFinishedDrawingRef.current = true;
        }
        setTimeout(() => {
          if (chartInstance && drawingToolRef?.current === currentDrawingTool) {
            chartInstance.setActiveLineTool(null);
            setTimeout(() => {
              if (justFinishedDrawingRef) {
                justFinishedDrawingRef.current = false;
              }
            }, 300);
          }
        }, 100);
      }
    };

    chartInstance.subscribeLineToolsAfterEdit(handleAfterEdit);

    return () => {
      if (chartInstance) {
        try {
          chartInstance.unsubscribeLineToolsAfterEdit(handleAfterEdit);
        } catch {
      void 0;
          void 0;
        }
      }
    };
  }, [chart, drawingToolRef, isRestoringStateRef, onDrawingToolDeactivate, justFinishedDrawingRef]);
};

