/**
 * Core type definitions for the NutriTrack application.
 *
 * All domain entities are strictly typed here to ensure
 * type safety across all layers: UI, services, and data.
 */

/** Represents a single food item in the database */
export interface FoodItem {
  /** Unique lowercase identifier used for lookup (e.g., "sandwich") */
  id: string;
  /** Human-readable display name (e.g., "Sandwich") */
  name: string;
  /** Calories per single serving */
  calories: number;
  /** Protein in grams per serving */
  protein: number;
  /** Carbohydrates in grams per serving */
  carbs: number;
  /** Fats in grams per serving */
  fats: number;
  /** Category for scoring and grouping */
  category: FoodCategory;
}

/** Food categories used for scoring penalties and suggestions */
export type FoodCategory =
  | 'grain'
  | 'protein'
  | 'dairy'
  | 'fruit'
  | 'vegetable'
  | 'snack'
  | 'beverage'
  | 'outside';

/** Aggregated nutrition data for a time period */
export interface NutritionData {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

/** Result of parsing user food input text */
export interface ParsedFoodInput {
  quantity: number;
  itemName: string;
}

/** A single food log entry with metadata */
export interface FoodLogEntry {
  id: string;
  foodItem: FoodItem;
  quantity: number;
  /** Whether this was marked as outside food by the user */
  isOutsideFood: boolean;
  timestamp: number;
}

/** Daily log containing all entries and computed data for one day */
export interface DailyLog {
  /** Date string in YYYY-MM-DD format */
  date: string;
  entries: FoodLogEntry[];
  nutrition: NutritionData;
  score: HealthScore;
}

/**
 * Health score with explanation.
 *
 * DESIGN NOTE: Score starts at 100 and penalties are deducted.
 * This is a deliberate psychological choice — starting high
 * encourages users to maintain good habits rather than
 * feeling they need to "earn" points from zero.
 */
export interface HealthScore {
  /** Numeric score from 0 to 100 */
  value: number;
  /** Previous score before last entry (for showing change) */
  previousValue: number | null;
  /** Human-readable explanation of the score */
  explanation: string;
  /** Letter grade derived from score */
  grade: ScoreGrade;
}

export type ScoreGrade = 'A' | 'B' | 'C' | 'D' | 'F';

/** Actionable suggestion based on nutritional deficiencies */
export interface Suggestion {
  /** The type of deficiency or issue identified */
  type: SuggestionType;
  /** User-facing message */
  message: string;
  /** Emoji icon for visual clarity */
  icon: string;
}

export type SuggestionType =
  | 'low_protein'
  | 'high_carbs'
  | 'high_fats'
  | 'high_calories'
  | 'low_calories'
  | 'too_much_outside_food'
  | 'missing_vegetables'
  | 'good_balance';

/** Heatmap data point representing a single day */
export interface HeatmapDay {
  date: string;
  score: number;
}

/** Keys for localStorage abstraction — avoids magic strings */
export enum StorageKey {
  DAILY_LOGS = 'nutritrack_daily_logs',
}
