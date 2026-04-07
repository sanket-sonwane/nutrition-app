import type { DailyLog, FoodLogEntry, HealthScore, NutritionData } from '../types';
import { FOOD_DATABASE } from '../data/foodDatabase';

/**
 * DUMMY DATA GENERATOR
 *
 * PURPOSE: This module generates realistic mock data for the last 30 days
 * to demonstrate the "behavior improvement" narrative of the app.
 *
 * BEHAVIORAL DESIGN:
 * - Older days (30–20 days ago) → lower scores (40–60), more outside food
 * - Middle days (19–10 days ago) → improving scores (55–75)
 * - Recent days (9–1 days ago)  → higher scores (70–90), healthier choices
 *
 * This creates a visible upward trend in the heatmap that reinforces
 * the idea that "the app is working" — a powerful motivational tool
 * rooted in behavioral psychology (progress visualization).
 *
 * NOTE: Today is never pre-filled so the user starts fresh.
 */

/** Generate a YYYY-MM-DD date string for N days ago */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Get a random integer between min (inclusive) and max (inclusive) */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick a random item from an array */
function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate simulated food entries for a single day.
 * The "phase" determines how healthy the choices are.
 */
function generateDayEntries(
  phase: 'early' | 'middle' | 'recent'
): FoodLogEntry[] {
  const healthyFoods = FOOD_DATABASE.filter(
    (f) => f.category === 'protein' || f.category === 'vegetable' || f.category === 'fruit' || f.category === 'dairy'
  );
  const unhealthyFoods = FOOD_DATABASE.filter(
    (f) => f.category === 'outside' || f.category === 'snack'
  );
  const grains = FOOD_DATABASE.filter((f) => f.category === 'grain');

  const entries: FoodLogEntry[] = [];
  const entryCount = randomInt(3, 6);

  for (let i = 0; i < entryCount; i++) {
    let food;
    let isOutside = false;

    // Phase determines the probability of healthy vs unhealthy choices
    const roll = Math.random();

    if (phase === 'early') {
      // Early phase: 50% unhealthy, 30% grain, 20% healthy
      if (roll < 0.5) {
        food = pickRandom(unhealthyFoods);
        isOutside = food.category === 'outside';
      } else if (roll < 0.8) {
        food = pickRandom(grains);
      } else {
        food = pickRandom(healthyFoods);
      }
    } else if (phase === 'middle') {
      // Middle phase: 25% unhealthy, 35% grain, 40% healthy
      if (roll < 0.25) {
        food = pickRandom(unhealthyFoods);
        isOutside = food.category === 'outside';
      } else if (roll < 0.6) {
        food = pickRandom(grains);
      } else {
        food = pickRandom(healthyFoods);
      }
    } else {
      // Recent phase: 10% unhealthy, 30% grain, 60% healthy
      if (roll < 0.1) {
        food = pickRandom(unhealthyFoods);
        isOutside = food.category === 'outside';
      } else if (roll < 0.4) {
        food = pickRandom(grains);
      } else {
        food = pickRandom(healthyFoods);
      }
    }

    const quantity = randomInt(1, 2);

    entries.push({
      id: `dummy-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      foodItem: food,
      quantity,
      isOutsideFood: isOutside,
      timestamp: Date.now() - i * 3600000, // spread across hours
    });
  }

  return entries;
}

/**
 * Compute basic nutrition totals from entries.
 */
function computeNutrition(entries: FoodLogEntry[]): NutritionData {
  return entries.reduce(
    (acc, entry) => ({
      totalCalories: acc.totalCalories + entry.foodItem.calories * entry.quantity,
      totalProtein: acc.totalProtein + entry.foodItem.protein * entry.quantity,
      totalCarbs: acc.totalCarbs + entry.foodItem.carbs * entry.quantity,
      totalFats: acc.totalFats + entry.foodItem.fats * entry.quantity,
    }),
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 }
  );
}

/**
 * Generate a simplified score for dummy data.
 * Uses the same deduction philosophy as the real score service.
 */
function computeDummyScore(
  nutrition: NutritionData,
  entries: FoodLogEntry[],
  phase: 'early' | 'middle' | 'recent'
): HealthScore {
  // Base noise to add variety within each phase
  const phaseBaseScores = { early: randomInt(35, 55), middle: randomInt(55, 72), recent: randomInt(72, 92) };
  const value = Math.max(0, Math.min(100, phaseBaseScores[phase]));

  const grade = value >= 81 ? 'A' as const
    : value >= 61 ? 'B' as const
    : value >= 41 ? 'C' as const
    : value >= 21 ? 'D' as const
    : 'F' as const;

  const outsideCount = entries.filter((e) => e.isOutsideFood).length;
  let explanation = '';
  if (value >= 81) explanation = 'Great balance! Keep it up.';
  else if (value >= 61) explanation = 'Good day, minor improvements possible.';
  else if (outsideCount >= 2) explanation = 'Too much outside food today.';
  else explanation = 'Nutritional balance needs work.';

  return { value, previousValue: null, explanation, grade };
}

/**
 * Generate 30 days of dummy data showing an improvement trend.
 * Skips today (day 0) so the user starts fresh.
 *
 * @returns A Record<string, DailyLog> keyed by date strings
 */
export function generateDummyData(): Record<string, DailyLog> {
  const logs: Record<string, DailyLog> = {};

  for (let dayOffset = 30; dayOffset >= 1; dayOffset--) {
    const date = daysAgo(dayOffset);

    // Determine behavior phase based on how old the day is
    let phase: 'early' | 'middle' | 'recent';
    if (dayOffset >= 21) {
      phase = 'early';
    } else if (dayOffset >= 11) {
      phase = 'middle';
    } else {
      phase = 'recent';
    }

    const entries = generateDayEntries(phase);
    const nutrition = computeNutrition(entries);
    const score = computeDummyScore(nutrition, entries, phase);

    logs[date] = { date, entries, nutrition, score };
  }

  return logs;
}
