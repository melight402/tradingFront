import { useEffect } from "react";

export const useLineToolEditHandler = (
  chart,
  drawingToolRef,
  isRestoringStateRef,
  onDrawingToolDeactivate
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
        setTimeout(() => {
          if (chartInstance && drawingToolRef?.current === currentDrawingTool) {
            chartInstance.setActiveLineTool(null);
            if (onDrawingToolDeactivate) {
              onDrawingToolDeactivate();
            }
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
        }
      }
    };
  }, [chart, drawingToolRef, isRestoringStateRef, onDrawingToolDeactivate]);
};

