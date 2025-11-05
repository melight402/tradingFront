import React, { useEffect } from "react";
import { COLORS } from "../../constants";
import "../../styles/styles.css";

const OrderConfirmationModal = ({ isOpen, onConfirm, onCancel, reason, orderPrice, marketPrice }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="order-confirmation-overlay" onClick={handleOverlayClick}>
      <div className="order-confirmation-modal modal-content-scroll" onClick={(e) => e.stopPropagation()}>
        <div className="order-confirmation-title">⚠️ Подтверждение ордера</div>
        
        <div className="order-confirmation-warning">
          {reason}
        </div>

        {orderPrice && marketPrice && (
          <div className="order-confirmation-details">
            <div className="order-confirmation-price-row">
              <span>Текущая рыночная цена:</span>
              <span className="order-confirmation-price-value">{marketPrice.toFixed(2)}</span>
            </div>
            <div className="order-confirmation-price-row">
              <span>Цена ордера:</span>
              <span className="order-confirmation-price-value order-confirmation-price-unfavorable">{orderPrice.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="order-confirmation-message">
          Вы уверены, что хотите разместить этот ордер? Лимитный ордер предназначен для размещения в книге ордеров, а не для немедленного исполнения.
        </div>

        <div className="order-confirmation-buttons">
          <button
            className="order-confirmation-button order-confirmation-button-cancel"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            className="order-confirmation-button order-confirmation-button-confirm"
            onClick={onConfirm}
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationModal;

