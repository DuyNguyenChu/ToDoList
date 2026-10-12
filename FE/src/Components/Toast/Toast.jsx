import { useState, useEffect } from "react";
import "./Toast.css";

let listeners = [];

export const showToast = {
  success: (message, duration = 3200) =>
    emitToast({ message, type: "success", duration }),
  error: (message, duration = 4000) =>
    emitToast({ message, type: "error", duration }),
  warning: (message, duration = 3500) =>
    emitToast({ message, type: "warning", duration }),
  info: (message, duration = 3000) =>
    emitToast({ message, type: "info", duration }),
};

function emitToast(toastData) {
  const id = Date.now() + Math.random().toString(36).substring(2, 7);
  listeners.forEach((fn) => fn({ ...toastData, id }));
}

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleAdd = (toast) => {
      setToasts((prev) => [...prev, toast]);
      if (toast.duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        }, toast.duration);
      }
    };

    listeners.push(handleAdd);
    return () => {
      listeners = listeners.filter((fn) => fn !== handleAdd);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-portal-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-card toast-${toast.type}`}>
          <div className="toast-icon-wrap">
            {toast.type === "success" && (
              <span className="toast-icon success-icon">✓</span>
            )}
            {toast.type === "error" && (
              <span className="toast-icon error-icon">✕</span>
            )}
            {toast.type === "warning" && (
              <span className="toast-icon warning-icon">⚠️</span>
            )}
            {toast.type === "info" && (
              <span className="toast-icon info-icon">ℹ️</span>
            )}
          </div>
          <div className="toast-body">
            <p className="toast-message">{toast.message}</p>
          </div>
          <button
            type="button"
            className="toast-dismiss-btn"
            onClick={() => removeToast(toast.id)}
            title="Đóng"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
