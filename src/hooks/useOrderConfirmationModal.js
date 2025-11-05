import { useState } from "react";

export const useOrderConfirmationModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [resolvePromise, setResolvePromise] = useState(null);

  const showConfirmation = (data) => {
    return new Promise((resolve) => {
      setConfirmationData(data);
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
    setConfirmationData(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
    setConfirmationData(null);
  };

  return {
    isOpen,
    confirmationData,
    showConfirmation,
    handleConfirm,
    handleCancel
  };
};

