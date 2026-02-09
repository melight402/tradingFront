import { useRef, useCallback, useEffect } from 'react';

/**
 * Безопасный throttle для React
 * Автоматически очищает таймер при unmount компонента
 * Предотвращает утечки памяти
 */
export const useThrottle = (callback, delay) => {
  const lastCallRef = useRef(Date.now());
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return useCallback(
    (...args) => {
      const now = Date.now();
      const remaining = delay - (now - lastCallRef.current);
      
      if (remaining <= 0) {
        callback(...args);
        lastCallRef.current = now;
      } else {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastCallRef.current = Date.now();
        }, remaining);
      }
    },
    [callback, delay]
  );
};
