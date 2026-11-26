import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_DURATION_MS = 3000;

export const useToast = (durationMs = DEFAULT_DURATION_MS) => {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const showToast = useCallback(
    (next: string) => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      setMessage(next);
      timerRef.current = setTimeout(() => {
        setMessage(null);
        timerRef.current = null;
      }, durationMs);
    },
    [durationMs],
  );

  useEffect(() => clearTimer, []);

  return { message, showToast };
};
