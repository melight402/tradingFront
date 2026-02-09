import { useRef, useCallback, useEffect } from 'react';

/**
 * Безопасный debounce для React
 * Автоматически очищает таймер при unmount компонента
 * Предотвращает утечки памяти
 */
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  
  // Очистить таймер при unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};
