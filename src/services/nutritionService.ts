import type { FoodItem, NutritionData, FoodLogEntry } from '../types';
import { FOOD_LOOKUP } from '../data/foodDatabase';

/**
 * Nutrition Service
 *
 * Pure functions for food item lookup and nutrition aggregation.
 * No side effects — all calculations are deterministic given the same input.
 */

/**
 * Look up a food item by its normalized name.
 * @returns The matched FoodItem or undefined if not found
 */
export function lookupFoodItem(itemName: string): FoodItem | undefined {
  return FOOD_LOOKUP.get(itemName.toLowerCase().trim());
}

/**
 * Calculate nutrition data for a single food item at a given quantity.
 * Multiplies all nutritional values by the quantity.
 */
export function calculateItemNutrition(
  foodItem: FoodItem,
  quantity: number
): NutritionData {
  return {
    totalCalories: round(foodItem.calories * quantity),
    totalProtein: round(foodItem.protein * quantity),
    totalCarbs: round(foodItem.carbs * quantity),
    totalFats: round(foodItem.fats * quantity),
  };
}

/**
 * Aggregate nutrition across multiple food log entries.
 * Used to compute daily totals.
 */
export function aggregateNutrition(entries: FoodLogEntry[]): NutritionData {
  const totals = entries.reduce<NutritionData>(
    (acc, entry) => {
      const item = calculateItemNutrition(entry.foodItem, entry.quantity);
      return {
        totalCalories: acc.totalCalories + item.totalCalories,
        totalProtein: acc.totalProtein + item.totalProtein,
        totalCarbs: acc.totalCarbs + item.totalCarbs,
        totalFats: acc.totalFats + item.totalFats,
      };
    },
    emptyNutrition()
  );

  return {
    totalCalories: round(totals.totalCalories),
    totalProtein: round(totals.totalProtein),
    totalCarbs: round(totals.totalCarbs),
    totalFats: round(totals.totalFats),
  };
}

/** Create an empty NutritionData object (zero values) */
export function emptyNutrition(): NutritionData {
  return { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 };
}

/** Round a number to one decimal place */
function round(value: number): number {
  return Math.round(value * 10) / 10;
}
