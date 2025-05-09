"use client";

import { useState, useEffect, useCallback } from 'react';

function useLocalStorageState<T>(
  key: string,
  defaultValue: T | (() => T)
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;
    }
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue);
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
    return typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;
  });

  const setLocalStorageState = useCallback(
    (valueOrFn: React.SetStateAction<T>) => {
      setState(prevState => {
        const newValue = typeof valueOrFn === 'function' 
          ? (valueOrFn as (prevState: T) => T)(prevState) 
          : valueOrFn;
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(key, JSON.stringify(newValue));
          } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
          }
        }
        return newValue;
      });
    },
    [key]
  );
  
  // Listen to storage events to sync state across tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setState(JSON.parse(event.newValue));
        } catch (error) {
           console.error(`Error parsing storage event data for key "${key}":`, error);
        }
      } else if (event.key === key && event.newValue === null) {
        // Item was removed or cleared
         setState(typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, defaultValue]);


  return [state, setLocalStorageState];
}

export default useLocalStorageState;
