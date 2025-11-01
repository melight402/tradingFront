import React, { useEffect } from "react";
import { ORDER_TYPE_LABELS, ORDER_FIELDS_INFO, COLORS } from "../../constants";
import "../../styles/styles.css";

const OrderTypeFieldsInfo = ({ orderType, isOpen, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !orderType || !ORDER_FIELDS_INFO[orderType]) {
    return null;
  }

  const info = ORDER_FIELDS_INFO[orderType];

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="order-fields-overlay" onClick={handleOverlayClick}>
      <div className="order-fields-modal modal-content-scroll" onClick={(e) => e.stopPropagation()}>
        <button
          className="order-fields-close-button"
          onClick={onClose}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = COLORS.background.hover;
            e.target.style.color = COLORS.text.primary;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = COLORS.text.secondary;
          }}
          aria-label="Закрыть"
        >
          ×
        </button>

        <div className="order-fields-title">
          Дополнительные поля для: {ORDER_TYPE_LABELS[orderType] || orderType}
        </div>

        {info.description && (
          <div className="order-fields-description">{info.description}</div>
        )}

        {info.required && info.required.length > 0 && (
          <>
            <div className="order-fields-section-title">
              Обязательные поля <span className="order-fields-badge order-fields-badge-required">ОБЯЗАТЕЛЬНО</span>
            </div>
            {info.required.map((field, index) => (
              <div key={index} className="order-fields-field-item">
                <strong>{field.label}</strong> ({field.field})
                {field.type === "select" && field.options && (
                  <span className="order-fields-note">→ Опции: {field.options.join(", ")}</span>
                )}
                {field.note && <span className="order-fields-note">→ {field.note}</span>}
              </div>
            ))}
          </>
        )}

        {info.optional && info.optional.length > 0 && (
          <>
            <div className="order-fields-section-title">
              Опциональные поля <span className="order-fields-badge order-fields-badge-optional">ОПЦИОНАЛЬНО</span>
            </div>
            {info.optional.map((field, index) => (
              <div key={index} className="order-fields-field-item">
                <strong>{field.label}</strong> ({field.field})
                {field.type === "select" && field.options && (
                  <span className="order-fields-note">→ Опции: {field.options.join(", ")}</span>
                )}
                {field.note && <span className="order-fields-note">→ {field.note}</span>}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderTypeFieldsInfo;
