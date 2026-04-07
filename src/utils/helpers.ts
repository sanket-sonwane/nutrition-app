import type { DailyLog, HeatmapDay } from '../types';
import { StorageKey } from '../types';

/**
 * Utility helpers for the NutriTrack application.
 * Includes localStorage abstraction, date formatting, and common utilities.
 */

// ─── localStorage Abstraction ────────────────────────────────────────────────

/**
 * Safely read and parse JSON data from localStorage.
 * Returns the default value if the key doesn't exist or parsing fails.
 */
export function getFromStorage<T>(key: StorageKey, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[NutriTrack] Failed to read from storage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely serialize and save data to localStorage.
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
export function removeFromStorage(key: StorageKey): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`[NutriTrack] Failed to remove storage key "${key}":`, error);
  }
}

// ─── Date Utilities ──────────────────────────────────────────────────────────

/**
 * Get today's date as a YYYY-MM-DD string.
 * Uses local timezone.
 */
export function getTodayDateString(): string {
  return formatDate(new Date());
}

/**
 * Format a Date object to YYYY-MM-DD string.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date string for display (e.g., "Apr 7, 2026").
 */
export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get the last N days as date strings (including today).
 */
export function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(formatDate(date));
  }

  return dates;
}

// ─── ID Generation ───────────────────────────────────────────────────────────

/**
 * Generate a unique ID for food log entries.
 * Uses timestamp + random suffix for reasonable uniqueness.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ─── Heatmap Helpers ─────────────────────────────────────────────────────────

/**
 * Build heatmap data from stored daily logs.
 * Returns the last 30 days with scores (0 for days with no data).
 */
export function buildHeatmapData(logs: Record<string, DailyLog>): HeatmapDay[] {
  const last30Days = getLastNDays(30);

  return last30Days.map((date) => {
    const log = logs[date];
    return {
      date,
      score: log?.score?.value ?? 0,
      grade: log?.score?.grade ?? 'F',
    };
  });
}

// ─── Formatting Helpers ──────────────────────────────────────────────────────

/**
 * Format a number with appropriate units for display.
 * e.g., 1234 → "1,234"
 */
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

/**
 * Get a short day label (Mon, Tue, etc.) from a date string.
 */
export function getDayLabel(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
