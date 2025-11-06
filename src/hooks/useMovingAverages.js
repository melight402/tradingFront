import { useEffect, useRef } from "react";
import { calculateMA } from "../utils/maCalculator";

export const useMovingAverages = (chart, candlestickSeries, data, chartKey) => {
  const ma50Series = useRef(null);
  const ma200Series = useRef(null);

  useEffect(() => {
    if (!chart.current || !candlestickSeries.current || !data || !Array.isArray(data) || data.length === 0) {
      return;
    }

    if (chartKey !== "chart1d") {
      if (ma50Series.current) {
        try {
          chart.current.removeSeries(ma50Series.current);
        } catch {
          void 0;
        }
        ma50Series.current = null;
      }
      if (ma200Series.current) {
        try {
          chart.current.removeSeries(ma200Series.current);
        } catch {
          void 0;
        }
        ma200Series.current = null;
      }
      return;
    }

    if (!ma50Series.current) {
      ma50Series.current = chart.current.addLineSeries({
        color: "#2196f3",
        lineWidth: 2,
        priceFormat: {
          type: "price",
          precision: 2,
          minMove: 0.01,
        },
        priceScaleId: "right",
        title: "MA50",
      });
    }

    if (!ma200Series.current) {
      ma200Series.current = chart.current.addLineSeries({
        color: "#ffeb3b",
        lineWidth: 2,
        priceFormat: {
          type: "price",
          precision: 2,
          minMove: 0.01,
        },
        priceScaleId: "right",
        title: "MA200",
      });
    }

    const ma50Data = calculateMA(data, 50);
    const ma200Data = calculateMA(data, 200);

    if (ma50Data.length > 0) {
      ma50Series.current.setData(ma50Data);
    }

    if (ma200Data.length > 0) {
      ma200Series.current.setData(ma200Data);
    }
  }, [chart, candlestickSeries, data, chartKey]);

  useEffect(() => {
    return () => {
      if (ma50Series.current && chart.current) {
        try {
          chart.current.removeSeries(ma50Series.current);
        } catch {
          void 0;
        }
        ma50Series.current = null;
      }
      if (ma200Series.current && chart.current) {
        try {
          chart.current.removeSeries(ma200Series.current);
        } catch {
          void 0;
        }
        ma200Series.current = null;
      }
    };
  }, [chart]);
};

