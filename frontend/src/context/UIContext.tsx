import React, { createContext, useContext, useState } from 'react';

interface UIContextType {
  error: string;
  setError: (msg: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState('');
  return (
    <UIContext.Provider value={{ error, setError }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI debe usarse dentro de un UIProvider');
  return context;
}; 