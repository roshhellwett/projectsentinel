import { useEffect, useState } from 'react';

let lastFreshAt = 0;
const subscribers = new Set<(ts: number) => void>();

export function useLastFresh(): number {
  const [value, setValue] = useState<number>(0);
  useEffect(() => {
    const update = (ts: number) => setValue(ts);
    subscribers.add(update);
    if (lastFreshAt > 0) setValue(lastFreshAt);
    return () => {
      subscribers.delete(update);
    };
  }, []);
  return value;
}
