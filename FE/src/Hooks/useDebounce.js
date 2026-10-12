import { useState, useEffect } from "react";

/**
 * Custom hook to debounce a value by a specified delay in milliseconds.
 * Prevents redundant re-renders and excessive network requests.
 * @param {*} value The value to debounce
 * @param {number} delay Delay in ms (default: 1000ms - 1 second)
 * @returns Debounced value
 */
export const useDebounce = (value, delay = 1000) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
