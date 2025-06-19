import React, { useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { useUI } from '@/context/UIContext';

interface MessageDisplayProps {
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ 
  autoHide = true, 
  autoHideDelay = 5000 
}) => {
  const { 
    error, 
    success, 
    warning, 
    info, 
    clearError, 
    clearSuccess, 
    setWarning, 
    setInfo 
  } = useUI();

  useEffect(() => {
    if (autoHide && success) {
      const timer = setTimeout(() => {
        clearSuccess();
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [success, autoHide, autoHideDelay, clearSuccess]);

  useEffect(() => {
    if (autoHide && warning) {
      const timer = setTimeout(() => {
        setWarning('');
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [warning, autoHide, autoHideDelay, setWarning]);

  useEffect(() => {
    if (autoHide && info) {
      const timer = setTimeout(() => {
        setInfo('');
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [info, autoHide, autoHideDelay, setInfo]);

  if (!error && !success && !warning && !info) {
    return null;
  }

  return (
    <div className="message-display">
      {error && (
        <Alert 
          variant="danger" 
          dismissible 
          onClose={clearError}
          className="mb-3"
        >
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          variant="success" 
          dismissible 
          onClose={clearSuccess}
          className="mb-3"
        >
          <i className="bi bi-check-circle me-2"></i>
          {success}
        </Alert>
      )}
      
      {warning && (
        <Alert 
          variant="warning" 
          dismissible 
          onClose={() => setWarning('')}
          className="mb-3"
        >
          <i className="bi bi-exclamation-triangle me-2"></i>
          {warning}
        </Alert>
      )}
      
      {info && (
        <Alert 
          variant="info" 
          dismissible 
          onClose={() => setInfo('')}
          className="mb-3"
        >
          <i className="bi bi-info-circle me-2"></i>
          {info}
        </Alert>
      )}
    </div>
  );
};

export default MessageDisplay; 