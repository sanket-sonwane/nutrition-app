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
import {
  calculateHealthScore,
  generateSuggestion,
} from '../services/scoreService';
import {
  getFromStorage,
  saveToStorage,
  getTodayDateString,
  generateId,
  buildHeatmapData,
} from '../utils/helpers';

/**
 * Return type for the useHealthData hook.
 * Provides all state and actions needed by the UI.
 */
interface UseHealthDataReturn {
  /** Today's food log entries */
  todayEntries: FoodLogEntry[];
  /** Aggregated nutrition for today */
  todayNutrition: NutritionData;
  /** Today's health score */
  todayScore: HealthScore;
  /** Current suggestion based on today's data */
  suggestion: Suggestion;
  /** Heatmap data for the last 30 days */
  heatmapData: HeatmapDay[];
  /** Today's date string */
  todayDate: string;
  /** Add a food entry via text input; returns error message or null */
  addFoodEntry: (input: string) => string | null;
  /** Remove a food entry by ID */
  removeFoodEntry: (entryId: string) => void;
  /** Clear all entries for today */
  clearToday: () => void;
}

/**
 * Custom hook that manages all nutrition tracking state.
 *
 * Handles:
 * - Loading/saving daily logs from localStorage
 * - Adding/removing food entries
 * - Computing nutrition totals, health score, and suggestions
 * - Building heatmap data from historical logs
 */
export function useHealthData(): UseHealthDataReturn {
  const todayDate = getTodayDateString();

  // Load all daily logs from storage
  const [allLogs, setAllLogs] = useState<Record<string, DailyLog>>(() =>
    getFromStorage(StorageKey.DAILY_LOGS, {})
  );

  // Extract today's entries from the stored logs
  const todayEntries = useMemo(
    () => allLogs[todayDate]?.entries ?? [],
    [allLogs, todayDate]
  );

  // Calculate derived data from today's entries
  const todayNutrition = useMemo(
    () => (todayEntries.length > 0 ? aggregateNutrition(todayEntries) : emptyNutrition()),
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

  const heatmapData = useMemo(
    () => buildHeatmapData(allLogs),
    [allLogs]
  );

  // Persist logs to localStorage whenever they change
  useEffect(() => {
    saveToStorage(StorageKey.DAILY_LOGS, allLogs);
  }, [allLogs]);

  /**
   * Update today's log in state with new entries.
   * Recalculates nutrition and score for the day.
   */
  const updateTodayLog = useCallback(
    (entries: FoodLogEntry[]) => {
      const nutrition = entries.length > 0 ? aggregateNutrition(entries) : emptyNutrition();
      const score = calculateHealthScore(nutrition, entries);

      setAllLogs((prev) => ({
        ...prev,
        [todayDate]: { date: todayDate, entries, nutrition, score },
      }));
    },
    [todayDate]
  );

  /**
   * Add a food entry from a raw text input string.
   * @returns Error message string if parsing/lookup fails, null on success
   */
  const addFoodEntry = useCallback(
    (input: string): string | null => {
      const parsed = parseFoodInput(input);
      if (!parsed) {
        return 'Invalid input. Try: "2 sandwich" or "apple"';
      }

      const foodItem = lookupFoodItem(parsed.itemName);
      if (!foodItem) {
        return `"${parsed.itemName}" not found in database. Try a different food item.`;
      }

      const newEntry: FoodLogEntry = {
        id: generateId(),
        foodItem,
        quantity: parsed.quantity,
        timestamp: Date.now(),
      };

      const updatedEntries = [...todayEntries, newEntry];
      updateTodayLog(updatedEntries);
      return null;
    },
    [todayEntries, updateTodayLog]
  );

  /**
   * Remove a food entry by its unique ID.
   */
  const removeFoodEntry = useCallback(
    (entryId: string) => {
      const updatedEntries = todayEntries.filter((e) => e.id !== entryId);
      updateTodayLog(updatedEntries);
    },
    [todayEntries, updateTodayLog]
  );

  /**
   * Clear all entries for today.
   */
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
