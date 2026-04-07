import { StorageKey } from '../types';

/**
 * localStorage abstraction layer.
 *
 * Components and hooks should NEVER access localStorage directly.
 * This module provides a safe, typed interface with error handling
 * to prevent runtime crashes from storage quota or parsing errors.
 */

/**
 * Read and parse JSON data from localStorage.
 * Returns the default value if key doesn't exist or parsing fails.
 */
export function getFromStorage<T>(key: StorageKey, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[NutriTrack] Failed to read storage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Serialize and save data to localStorage.
 */
export function saveToStorage<T>(key: StorageKey, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`[NutriTrack] Failed to save to storage key "${key}":`, error);
  }
}

/**
 * Remove a key from localStorage.
 */
export function clearStorage(key: StorageKey): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`[NutriTrack] Failed to remove storage key "${key}":`, error);
  }
}
