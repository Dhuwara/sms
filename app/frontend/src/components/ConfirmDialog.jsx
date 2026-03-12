import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmDialog - A styled confirmation dialog to replace window.confirm()
 *
 * Props:
 *  - isOpen: boolean
 *  - title: string
 *  - message: string
 *  - confirmText: string (default "Delete")
 *  - cancelText: string (default "Cancel")
 *  - onConfirm: () => void
 *  - onCancel: () => void
 *  - variant: "danger" | "warning" | "info" (default "danger")
 */
const ConfirmDialog = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'bg-red-100',
      iconColor: 'text-red-600',
      btn: 'bg-[#DC2626] hover:bg-[#B91C1C]',
    },
    warning: {
      icon: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      btn: 'bg-[#F59E0B] hover:bg-[#D97706]',
    },
    info: {
      icon: 'bg-blue-100',
      iconColor: 'text-blue-600',
      btn: 'bg-[#4F46E5] hover:bg-[#4338CA]',
    },
  };

  const styles = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className={`w-14 h-14 ${styles.icon} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <AlertTriangle className={styles.iconColor} size={28} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-[#0F172A] text-center mb-2">{title}</h3>

        {/* Message */}
        <p className="text-[#64748B] text-center mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border-2 border-[#E2E8F0] text-[#64748B] font-semibold rounded-xl hover:bg-[#F8FAFC] transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 ${styles.btn} text-white font-semibold rounded-xl transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
