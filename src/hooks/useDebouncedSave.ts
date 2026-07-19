import { useEffect, useRef, useState } from 'react';
import { saveData } from '../api';
import { SyncStatus } from '../types';

export function useDebouncedSave<T>(
  key: string,
  value: T,
  isLoaded: boolean,
  delay = 1500
): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const isFirst = useRef(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    setStatus('saving');
    const timer = setTimeout(async () => {
      try {
        await saveData(key, value);
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
      } catch {
        setStatus('error');
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [key, value, isLoaded, delay]);

  return status;
}

export function mergeSyncStatus(statuses: SyncStatus[]): SyncStatus {
  if (statuses.includes('error')) return 'error';
  if (statuses.includes('saving')) return 'saving';
  if (statuses.includes('saved')) return 'saved';
  return 'idle';
}
