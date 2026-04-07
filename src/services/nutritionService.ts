import type { FoodItem, NutritionData, FoodLogEntry } from '../types';
import { FOOD_LOOKUP } from '../data/foodDatabase';

/**
 * Nutrition service handles food item lookup and nutrition aggregation.
 * All calculations are pure functions with no side effects.
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
    totalCalories: roundToOneDecimal(foodItem.calories * quantity),
    totalProtein: roundToOneDecimal(foodItem.protein * quantity),
    totalCarbs: roundToOneDecimal(foodItem.carbs * quantity),
    totalFats: roundToOneDecimal(foodItem.fats * quantity),
  };
}

/**
 * Aggregate nutrition across multiple food log entries.
 * Used to compute daily totals.
 */
export function aggregateNutrition(entries: FoodLogEntry[]): NutritionData {
  const totals = entries.reduce<NutritionData>(
    (acc, entry) => {
      const itemNutrition = calculateItemNutrition(
        entry.foodItem,
        entry.quantity
      );
      return {
        totalCalories: acc.totalCalories + itemNutrition.totalCalories,
        totalProtein: acc.totalProtein + itemNutrition.totalProtein,
        totalCarbs: acc.totalCarbs + itemNutrition.totalCarbs,
        totalFats: acc.totalFats + itemNutrition.totalFats,
      };
    },
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 }
  );

  return {
    totalCalories: roundToOneDecimal(totals.totalCalories),
    totalProtein: roundToOneDecimal(totals.totalProtein),
    totalCarbs: roundToOneDecimal(totals.totalCarbs),
    totalFats: roundToOneDecimal(totals.totalFats),
  };
}

/**
 * Create an empty NutritionData object.
 * Useful for initialization and default values.
 */
export function emptyNutrition(): NutritionData {
  return {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
  };
}

/** Round a number to one decimal place */
function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}
