// Хук для debouncing значений и функций

import { useState, useEffect } from 'react';

/**
 * Дебаунс значение с задержкой
 * @param value - значение для дебаунса
 * @param delay - задержка в миллисекундах
 * @returns дебаунснутое значение
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Дебаунс функция с задержкой
 * @param fn - функция для дебаунса
 * @param delay - задержка в миллисекундах
 * @returns дебаунснутая функция
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Дебаунс функция для значений (throttle альтернатива)
 * @param fn - функция для дебаунса
 * @param delay - задержка в миллисекундах
 * @returns функция с дебаунсингом
 */
export function createDebounced<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  let lastCallTime = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCallTime >= delay) {
      lastCallTime = now;
      fn(...args);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        fn(...args);
      }, delay);
    }
  };
}

export default debounce;