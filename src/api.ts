// Simple API client that replaces localStorage with calls to our
// Express + MongoDB backend. Same shape of data, just saved for real.

const BASE = '/api/data';

export async function loadData<T>(key: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${BASE}/${key}`);
    if (!res.ok) throw new Error(`Failed to load ${key}`);
    const json = await res.json();
    return (json.value ?? fallback) as T;
  } catch (err) {
    console.error(`[api] Could not load "${key}", using fallback.`, err);
    return fallback;
  }
}

export async function saveData<T>(key: string, value: T): Promise<void> {
  try {
    const res = await fetch(`${BASE}/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    if (!res.ok) throw new Error(`Failed to save ${key}`);
  } catch (err) {
    console.error(`[api] Could not save "${key}".`, err);
  }
}
