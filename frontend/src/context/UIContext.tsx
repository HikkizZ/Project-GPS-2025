import React, { createContext, useContext, useState } from 'react';

interface UIContextType {
  // Estados de mensajes
  error: string;
  success: string;
  warning: string;
  info: string;
  
  // Estados de UI
  isLoading: boolean;
  isModalOpen: boolean;
  modalType: string | null;
  
  // Setters para mensajes
  setError: (msg: string) => void;
  setSuccess: (msg: string) => void;
  setWarning: (msg: string) => void;
  setInfo: (msg: string) => void;
  
  // Setters para UI
  setLoading: (loading: boolean) => void;
  openModal: (type: string) => void;
  closeModal: () => void;
  
  // Limpiar mensajes
  clearMessages: () => void;
  clearError: () => void;
  clearSuccess: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [warning, setWarning] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);

  const openModal = (type: string) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
    setWarning('');
    setInfo('');
  };

  const clearError = () => setError('');
  const clearSuccess = () => setSuccess('');

  return (
    <UIContext.Provider value={{ 
      error, 
      success, 
      warning, 
      info,
      isLoading,
      isModalOpen,
      modalType,
      setError, 
      setSuccess,
      setWarning,
      setInfo,
      setLoading: setIsLoading,
      openModal,
      closeModal,
      clearMessages,
      clearError,
      clearSuccess
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI debe usarse dentro de un UIProvider');
  return context;
}; 