import React from 'react';
import { useTimeAndSales } from '../../hooks/useTimeAndSales';
import { formatVolume } from '../../utils/formatters';
import '../../styles/styles.css';

const TimeAndSalesSummary = ({ symbol, interval, lastCandle }) => {
  const { buySum, sellSum, loading } = useTimeAndSales(symbol, interval, lastCandle);

  if (loading) {
    return (
      <div className="time-sales-summary">
        <span className="time-sales-label">Лента:</span>
        <span className="time-sales-value">Загрузка...</span>
      </div>
    );
  }

  return (
    <div className="time-sales-summary">
      <span className="time-sales-label">Лента:</span>
      <span className="time-sales-buy">Покупка: {formatVolume(buySum)}</span>
      <span className="time-sales-separator">|</span>
      <span className="time-sales-sell">Продажа: {formatVolume(sellSum)}</span>
    </div>
  );
};

export default TimeAndSalesSummary;

