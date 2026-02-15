import { useEffect } from "react";
import { createChart, ColorType, CrosshairMode } from "trading-charts-with-tools";
import { useVolumeScaleSync } from "./useVolumeScaleSync";

export const useChartInitialization = (
  chartContainerRef,
  chart,
  candlestickSeries,
  volumeSeries,
  volumeDataRef,
  height,
  volumeAreaHeight,
  onChartReadyRef
) => {
  
  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (chart.current) return;

    const containerWidth = chartContainerRef.current.clientWidth;
    
    const initializeChart = (width) => {
      if (!chartContainerRef.current || chart.current) return;

      chart.current = createChart(chartContainerRef.current, {
        width: width,
        height: height,
        layout: {
          background: { type: ColorType.Solid, color: "#191c27" },
          textColor: "#9EAAC7",
          fontSize: 16,
        },
        grid: {
          vertLines: {
            color: "rgba(56, 62, 85, 0.5)",
          },
          horzLines: {
            color: "rgba(56, 62, 85, 0.5)",
          },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: {
            color: "#9EAAC7",
            width: 1,
          },
          horzLine: {
            color: "#9EAAC7",
            width: 1,
          },
        },
        rightPriceScale: {
          visible: true,
          borderColor: "#383E55",
          textColor: "#FFFFFF",
          autoScale: true,
          entireTextOnly: false,
          drawTicks: true,
          scaleMargins: {
            top: 0.1,
            bottom: volumeAreaHeight,
          },
        },
        leftPriceScale: {
          visible: false,
          scaleMargins: {
            top: 1 - volumeAreaHeight,
            bottom: 0,
          },
        },
        timeScale: {
          borderColor: "#383E55",
          timeVisible: true,
          secondsVisible: false,
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: true,
        },
        handleScale: {
          axisPressedMouseMove: {
            time: true,
            price: true,
          },
          axisDoubleClickReset: true,
          mouseWheel: true,
          pinch: true,
        },
      });

      candlestickSeries.current = chart.current.addCandlestickSeries({
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
        priceFormat: {
          type: "price",
          precision: 2,
          minMove: 0.01,
        },
        priceScaleId: "right",
      });

      const volumeTop = 1 - volumeAreaHeight;
      
      volumeSeries.current = chart.current.addHistogramSeries({
        color: "#26a69a80",
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "left",
        scaleMargins: {
          top: volumeTop,
          bottom: 0,
        },
      });
      
      const leftPriceScale = chart.current.priceScale("left");
      leftPriceScale.applyOptions({
        visible: false,
        scaleMargins: {
          top: volumeTop,
          bottom: 0,
        },
        autoScale: true,
        entireTextOnly: false,
      });

      if (onChartReadyRef.current) {
        onChartReadyRef.current(chart.current);
      }
    };

    if (containerWidth === 0) {
      requestAnimationFrame(() => {
        if (!chartContainerRef.current || chart.current) return;
        const width = chartContainerRef.current.clientWidth;
        if (width > 0) {
          initializeChart(width);
        }
      });
    } else {
      initializeChart(containerWidth);
    }

    const handleResize = () => {
      if (chartContainerRef.current && chart.current) {
        chart.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    const onChartReady = onChartReadyRef.current;
    return () => {
      window.removeEventListener("resize", handleResize);
      if (chart.current) {
        try {
          chart.current.removeAllLineTools();
        } catch {
        }
        chart.current.remove();
        chart.current = null;
        candlestickSeries.current = null;
        volumeSeries.current = null;
      }
      if (onChartReady) {
        onChartReady(null);
      }
    };
  }, [volumeAreaHeight, height, chartContainerRef, chart, candlestickSeries, volumeSeries, onChartReadyRef]);

  useVolumeScaleSync(chart, volumeSeries, volumeDataRef, volumeAreaHeight);
};
