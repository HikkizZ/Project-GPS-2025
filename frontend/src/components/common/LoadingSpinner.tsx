import React from 'react';
import { Spinner } from 'react-bootstrap';
import { useUI } from '@/context/UIContext';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  useGlobalState?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  text = 'Cargando...',
  fullScreen = false,
  useGlobalState = false
}) => {
  const { isLoading } = useUI();

  // Si useGlobalState es true, solo mostrar si el estado global está cargando
  if (useGlobalState && !isLoading) {
    return null;
  }

  const spinnerSize = {
    sm: 'sm',
    md: undefined,
    lg: undefined
  }[size];

  const spinnerClass = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  }[size];

  if (fullScreen) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <Spinner 
            animation="border" 
            size={spinnerSize}
            className={spinnerClass}
            role="status"
          >
            <span className="visually-hidden">{text}</span>
          </Spinner>
          {text && <p className="mt-2 mb-0">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center p-3">
      <Spinner 
        animation="border" 
        size={spinnerSize}
        className={spinnerClass}
        role="status"
      >
        <span className="visually-hidden">{text}</span>
      </Spinner>
      {text && <span className="ms-2">{text}</span>}
    </div>
  );
};

export default LoadingSpinner; 