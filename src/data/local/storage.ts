const PREFIX = 'lpmo_';

export function readStore<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function writeStore<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to write to localStorage key "${PREFIX + key}"`, e);
  }
}

export function readSingle<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeSingle<T>(key: string, data: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to write to localStorage key "${PREFIX + key}"`, e);
  }
}

export function hasKey(key: string): boolean {
  return localStorage.getItem(PREFIX + key) !== null;
}
