import React, { useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { useUI } from '@/context';

export const GlobalMessages: React.FC = () => {
  const { error, success, warning, info, clearError, clearSuccess, clearMessages } = useUI();

  // Auto-clear success messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        clearSuccess();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, clearSuccess]);

  // Auto-clear info messages after 5 seconds
  useEffect(() => {
    if (info) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [info, clearMessages]);

  return (
    <div className="global-messages mb-3">
      {error && (
        <Alert variant="danger" dismissible onClose={clearError} className="mb-2">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={clearSuccess} className="mb-2">
          {success}
        </Alert>
      )}
      {warning && (
        <Alert variant="warning" dismissible className="mb-2">
          {warning}
        </Alert>
      )}
      {info && (
        <Alert variant="info" dismissible className="mb-2">
          {info}
        </Alert>
      )}
    </div>
  );
}; 