import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

export type UseSearchParamStateOptions = {
  debounceMs?: number;
};

/**
 * Text input state synced to a URL search param. The returned value updates
 * immediately on every keystroke, while the URL is updated after a debounce
 * (as a history replace, without scroll reset) so each keystroke does not
 * trigger a router navigation. External URL changes (back/forward navigation,
 * in-app links) are adopted into the local value.
 */
export const useSearchParamState = (
  key: string,
  { debounceMs = 300 }: UseSearchParamStateOptions = {},
): [value: string, setValue: (value: string) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramValue = searchParams.get(key) ?? '';
  const [value, setValue] = useState(paramValue);

  const valueRef = useRef(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const setValueAndSyncParams = (newValue: string) => {
    valueRef.current = newValue;
    setValue(newValue);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = undefined;
      setSearchParams(
        (prev) => {
          const newSearchParams = new URLSearchParams(prev);
          if (newValue) {
            newSearchParams.set(key, newValue);
          } else {
            newSearchParams.delete(key);
          }
          return newSearchParams;
        },
        { replace: true, preventScrollReset: true },
      );
    }, debounceMs);
  };

  // Adopt external URL changes, unless the user is mid-typing with a URL
  // update still pending (then the pending write wins)
  useEffect(() => {
    if (debounceRef.current === undefined && paramValue !== valueRef.current) {
      valueRef.current = paramValue;
      setValue(paramValue);
    }
  }, [paramValue]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return [value, setValueAndSyncParams];
};
