import React from "react";
import { createButtonHoverHandlers, createContainerStyle } from "../../utils";
import "../../styles/styles.css";

const DeleteTools = ({ onDeleteSelected, onDeleteAll }) => {
  const deleteButtonHandlers = createButtonHoverHandlers("danger");
  const containerStyle = createContainerStyle();

  return (
    <div style={containerStyle}>
      <button
        {...deleteButtonHandlers}
        onClick={onDeleteSelected}
        title="Удалить выбранный элемент (элемент должен быть выделен на графике)"
      >
        <span className="delete-button-content">
          <span>🗑️</span>
          <span>1</span>
        </span>
      </button>
      <button
        {...deleteButtonHandlers}
        onClick={onDeleteAll}
        title="Удалить все нарисованные элементы"
      >
        <span className="delete-button-content">
          <span>🗑️</span>
          <span>all</span>
        </span>
      </button>
    </div>
  );
};

export default DeleteTools;

