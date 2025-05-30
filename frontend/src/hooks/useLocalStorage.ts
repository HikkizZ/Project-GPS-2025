import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  // Estado para almacenar nuestro valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Obtener del localStorage local
      const item = window.localStorage.getItem(key);
      // Parsear JSON almacenado o si no hay, retornar initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Si hay error también retornar initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Retornar una versión envuelta del setter de useState que ...
  // ... persistirá el nuevo valor en localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permitir que value sea una función para que tengamos la misma API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Guardar el estado
      setStoredValue(valueToStore);
      
      // Guardar en localStorage local
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // Un implementación más avanzada manejaría el caso del error
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Eliminar el item del localStorage
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}; 