import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// Contexto para el router
interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

// Hook para usar el router
export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (context === undefined) {
    throw new Error('useRouter debe ser usado dentro de un RouterProvider');
  }
  return context;
};

// Proveedor del router
interface RouterProviderProps {
  children: ReactNode;
}

export const RouterProvider: React.FC<RouterProviderProps> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState('/');

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  // Manejar el botón de atrás del navegador
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    
    // Establecer la ruta inicial
    setCurrentPath(window.location.pathname);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const value: RouterContextType = {
    currentPath,
    navigate,
  };

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
};

// Componente de ruta
interface RouteProps {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
}

export const Route: React.FC<RouteProps> = ({ path, component: Component, exact = false }) => {
  const { currentPath } = useRouter();
  
  const isMatch = exact 
    ? currentPath === path 
    : currentPath.startsWith(path);

  return isMatch ? <Component /> : null;
};

// Componente Link
interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Link: React.FC<LinkProps> = ({ to, children, className, onClick }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
    onClick?.();
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}; 