import { useEffect, useState } from 'react';

// Re-renders every `intervalMs` so time-sensitive UI (e.g. the 8 PM CTA gate)
// updates without requiring user interaction. Default: once a minute.
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}
