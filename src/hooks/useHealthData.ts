import { useState, useCallback, useEffect, useMemo } from 'react';
import type {
  FoodLogEntry,
  DailyLog,
  NutritionData,
  HealthScore,
  HeatmapDay,
  Suggestion,
} from '../types';
import { StorageKey } from '../types';
import { parseFoodInput } from '../services/parserService';
import {
  lookupFoodItem,
  aggregateNutrition,
  emptyNutrition,
} from '../services/nutritionService';
import { calculateHealthScore } from '../services/scoreService';
import { generateSuggestion } from '../services/suggestionService';
import { getFromStorage, saveToStorage } from '../utils/localStorage';
import { generateDummyData } from '../utils/generateDummyData';

/**
 * Custom hook: useHealthData
 *
 * Central state management for the entire application.
 * Handles food logging, score computation, and heatmap data.
 *
 * All business logic is delegated to pure service functions —
 * this hook only orchestrates state transitions and persistence.
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Get today's date as YYYY-MM-DD */
function getTodayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Generate a unique entry ID */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Get the last N days as YYYY-MM-DD strings (including today) */
function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    );
  }
  return dates;
}

// ─── Hook Return Type ────────────────────────────────────────────────────────

interface UseHealthDataReturn {
  /** Today's food log entries */
  todayEntries: FoodLogEntry[];
  /** Aggregated nutrition for today */
  todayNutrition: NutritionData;
  /** Today's health score (starts at 100, penalties deducted) */
  todayScore: HealthScore;
  /** Current actionable suggestion */
  suggestion: Suggestion;
  /** Heatmap data for last 30 days */
  heatmapData: HeatmapDay[];
  /** Today's date string */
  todayDate: string;
  /** Add a food entry; returns error string or null on success */
  addFoodEntry: (input: string, isOutsideFood: boolean) => string | null;
  /** Remove a food entry by ID */
  removeFoodEntry: (entryId: string) => void;
  /** Clear all entries for today */
  clearToday: () => void;
}

// ─── Hook Implementation ────────────────────────────────────────────────────

export function useHealthData(): UseHealthDataReturn {
  const todayDate = getTodayDate();

  /**
   * Initialize logs from storage.
   * If no data exists, generate dummy data to demonstrate
   * the behavior improvement trend in the heatmap.
   */
  const [allLogs, setAllLogs] = useState<Record<string, DailyLog>>(() => {
    const stored = getFromStorage<Record<string, DailyLog>>(StorageKey.DAILY_LOGS, {});

    // If storage is empty, seed with dummy data for compelling demo
    if (Object.keys(stored).length === 0) {
      const dummyData = generateDummyData();
      saveToStorage(StorageKey.DAILY_LOGS, dummyData);
      return dummyData;
    }

    return stored;
  });

  // ─── Derived State (memoized) ──────────────────────────────────────

  const todayEntries = useMemo(
    () => allLogs[todayDate]?.entries ?? [],
    [allLogs, todayDate]
  );

  const todayNutrition = useMemo(
    () => todayEntries.length > 0 ? aggregateNutrition(todayEntries) : emptyNutrition(),
    [todayEntries]
  );

  const todayScore = useMemo(
    () => calculateHealthScore(todayNutrition, todayEntries),
    [todayNutrition, todayEntries]
  );

  const suggestion = useMemo(
    () => generateSuggestion(todayNutrition, todayEntries),
    [todayNutrition, todayEntries]
  );

  const heatmapData = useMemo(() => {
    const last30 = getLastNDays(30);
    return last30.map((date) => ({
      date,
      score: allLogs[date]?.score?.value ?? 0,
    }));
  }, [allLogs]);

  // ─── Persist to localStorage ────────────────────────────────────────

  useEffect(() => {
    saveToStorage(StorageKey.DAILY_LOGS, allLogs);
  }, [allLogs]);

  // ─── Actions ────────────────────────────────────────────────────────

  /** Recalculate and update today's log in state */
  const updateTodayLog = useCallback(
    (entries: FoodLogEntry[]) => {
      const nutrition = entries.length > 0 ? aggregateNutrition(entries) : emptyNutrition();

      // Capture previous score for delta display
      const previousScore = allLogs[todayDate]?.score?.value ?? 100;
      const score = calculateHealthScore(nutrition, entries, previousScore);

      setAllLogs((prev) => ({
        ...prev,
        [todayDate]: { date: todayDate, entries, nutrition, score },
      }));
    },
    [todayDate, allLogs]
  );

  /**
   * Add a food entry from raw text input.
   * @param input - User's text (e.g., "2 sandwich")
   * @param isOutsideFood - Whether the outside food toggle is checked
   * @returns Error message or null on success
   */
  const addFoodEntry = useCallback(
    (input: string, isOutsideFood: boolean): string | null => {
      const parsed = parseFoodInput(input);
      if (!parsed) {
        return 'Invalid input. Try: "2 sandwich" or "apple"';
      }

      const foodItem = lookupFoodItem(parsed.itemName);
      if (!foodItem) {
        return `"${parsed.itemName}" not found in our database. Try a different item.`;
      }

      const newEntry: FoodLogEntry = {
        id: generateId(),
        foodItem,
        quantity: parsed.quantity,
        isOutsideFood: isOutsideFood || foodItem.category === 'outside',
        timestamp: Date.now(),
      };

      updateTodayLog([...todayEntries, newEntry]);
      return null;
    },
    [todayEntries, updateTodayLog]
  );

  /** Remove a single entry by ID */
  const removeFoodEntry = useCallback(
    (entryId: string) => {
      updateTodayLog(todayEntries.filter((e) => e.id !== entryId));
    },
    [todayEntries, updateTodayLog]
  );

  /** Clear all of today's entries */
  const clearToday = useCallback(() => {
    updateTodayLog([]);
  }, [updateTodayLog]);

  return {
    todayEntries,
    todayNutrition,
    todayScore,
    suggestion,
    heatmapData,
    todayDate,
    addFoodEntry,
    removeFoodEntry,
    clearToday,
  };
}
