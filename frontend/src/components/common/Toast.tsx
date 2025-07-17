import React, { useState, useEffect, createContext, useContext } from 'react';
import { Toast as BootstrapToast, ToastContainer } from 'react-bootstrap';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <ToastContainer 
      className="position-fixed" 
      style={{ 
        top: '0.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'auto',
        maxWidth: '90%'
      }}
    >
      {toasts.map((toast) => (
        <BootstrapToast
          key={toast.id}
          show={true}
          delay={toast.duration}
          autohide
          className="toast-custom"
          onClose={() => removeToast(toast.id)}
        >
          <BootstrapToast.Header className={`toast-header-${toast.type}`}> 
            <i className={`bi ${getIconForType(toast.type)} toast-icon`}></i>
            <strong className="me-auto">{toast.title}</strong>
          </BootstrapToast.Header>
          <BootstrapToast.Body className="toast-body">
            {toast.message}
          </BootstrapToast.Body>
        </BootstrapToast>
      ))}
    </ToastContainer>
  );
};

const getIconForType = (type: ToastMessage['type']): string => {
  switch (type) {
    case 'success': return 'bi-check-circle-fill';
    case 'error': return 'bi-exclamation-triangle-fill';
    case 'warning': return 'bi-exclamation-circle-fill';
    case 'info': return 'bi-info-circle-fill';
    default: return 'bi-info-circle-fill';
  }
};

// CONTEXTO GLOBAL DE TOASTS
const ToastContext = createContext<any>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (title: string, message: string, duration?: number) => {
    addToast({ type: 'success', title, message, duration: 3000 });
  };

  const showError = (title: string, message: string, duration?: number) => {
    addToast({ type: 'error', title, message, duration: 3000 });
  };

  const showWarning = (title: string, message: string, duration?: number) => {
    addToast({ type: 'warning', title, message, duration: 3000 });
  };

  const showInfo = (title: string, message: string, duration?: number) => {
    addToast({ type: 'info', title, message, duration: 3000 });
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      clearAllToasts
    }}>
      {children}
      <Toast toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Hook para usar el contexto global de Toasts
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context) return context;
  // fallback local (por compatibilidad, pero se recomienda usar el provider global)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
  };
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  const showSuccess = (title: string, message: string, duration?: number) => {
    addToast({ type: 'success', title, message, duration: 3000 });
  };
  const showError = (title: string, message: string, duration?: number) => {
    addToast({ type: 'error', title, message, duration: 3000 });
  };
  const showWarning = (title: string, message: string, duration?: number) => {
    addToast({ type: 'warning', title, message, duration: 3000 });
  };
  const showInfo = (title: string, message: string, duration?: number) => {
    addToast({ type: 'info', title, message, duration: 3000 });
  };
  const clearAllToasts = () => {
    setToasts([]);
  };
  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAllToasts
  };
}; 