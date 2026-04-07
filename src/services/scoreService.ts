import type { HealthScore, NutritionData, FoodLogEntry, ScoreGrade } from '../types';

/**
 * HEALTH SCORE SERVICE
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  PSYCHOLOGICAL DESIGN CHOICE: Starting from 100                    │
 * │                                                                     │
 * │  The score begins at 100 and penalties are DEDUCTED.                │
 * │  This is NOT arbitrary — it's rooted in behavioral psychology:      │
 * │                                                                     │
 * │  1. Loss Aversion: Humans feel losses ~2x more than gains.          │
 * │     Starting high makes users want to PROTECT their score.          │
 * │                                                                     │
 * │  2. Positive Reinforcement: A high starting score tells the user    │
 * │     "you're doing well by default" rather than "prove yourself."    │
 * │                                                                     │
 * │  3. Immediate Feedback: Seeing 100 → 85 after a burger is more     │
 * │     impactful than seeing 0 → 15 after eating salad.                │
 * │                                                                     │
 * │  This approach encourages sustained healthy behavior through        │
 * │  protection motivation rather than achievement motivation.          │
 * └─────────────────────────────────────────────────────────────────────┘
 */

// ─── Penalty Constants (avoid magic numbers) ────────────────────────────────

/** Maximum score (starting point) */
const MAX_SCORE = 100;

/** Daily recommended values for penalty calculations */
const DAILY_TARGETS = {
  calories: 2000,
  protein: 50,      // grams
  carbs: 250,        // grams
  fats: 65,          // grams
} as const;

/**
 * Penalty weights for each scoring factor.
 * Higher weight = more impact on the final score.
 */
const PENALTIES = {
  /** Penalty per 100 excess calories over target */
  EXCESS_CALORIES_PER_100: 5,
  /** Max penalty for calorie excess */
  EXCESS_CALORIES_MAX: 25,

  /** Penalty when protein is below 60% of target */
  LOW_PROTEIN: 15,
  /** Penalty when protein is below 30% of target */
  VERY_LOW_PROTEIN: 25,

  /** Penalty when carb ratio exceeds 60% of total calories */
  HIGH_CARB_RATIO: 12,
  /** Penalty when carb ratio exceeds 70% */
  VERY_HIGH_CARB_RATIO: 20,

  /** Penalty when fat ratio exceeds 40% of total calories */
  HIGH_FAT_RATIO: 10,
  /** Penalty when fat ratio exceeds 50% */
  VERY_HIGH_FAT_RATIO: 18,

  /** Penalty per outside food entry */
  OUTSIDE_FOOD_PER_ITEM: 8,
  /** Max penalty for outside food */
  OUTSIDE_FOOD_MAX: 30,
} as const;

/** Calorie-per-gram multipliers */
const CALS_PER_GRAM = { protein: 4, carbs: 4, fats: 9 } as const;

// ─── Main Score Calculation ──────────────────────────────────────────────────

/**
 * Calculate health score using the deduction model.
 *
 * Starts at 100 and applies penalties for:
 * 1. Excess calorie intake
 * 2. Low protein consumption
 * 3. High carbohydrate ratio
 * 4. High fat ratio
 * 5. Outside food entries
 *
 * @param nutrition - Aggregated daily nutrition data
 * @param entries - Individual food log entries
 * @param previousScore - The score before the latest entry (for delta display)
 * @returns HealthScore with value, explanation, and grade
 */
export function calculateHealthScore(
  nutrition: NutritionData,
  entries: FoodLogEntry[],
  previousScore: number | null = null
): HealthScore {
  // No food logged yet — perfect score, encourage the user
  if (entries.length === 0) {
    return {
      value: MAX_SCORE,
      previousValue: null,
      explanation: 'Start logging your meals to see your score!',
      grade: 'A',
    };
  }

  let score = MAX_SCORE;
  const reasons: string[] = [];

  // 1. Excess calorie penalty
  const calorieExcess = nutrition.totalCalories - DAILY_TARGETS.calories;
  if (calorieExcess > 0) {
    const penalty = Math.min(
      Math.floor(calorieExcess / 100) * PENALTIES.EXCESS_CALORIES_PER_100,
      PENALTIES.EXCESS_CALORIES_MAX
    );
    score -= penalty;
    reasons.push('Calorie intake is above target');
  }

  // 2. Low protein penalty
  const proteinRatio = nutrition.totalProtein / DAILY_TARGETS.protein;
  if (proteinRatio < 0.3) {
    score -= PENALTIES.VERY_LOW_PROTEIN;
    reasons.push('Protein intake is very low');
  } else if (proteinRatio < 0.6) {
    score -= PENALTIES.LOW_PROTEIN;
    reasons.push('Protein intake is low');
  }

  // 3. High carb ratio penalty
  if (nutrition.totalCalories > 0) {
    const carbCalRatio =
      (nutrition.totalCarbs * CALS_PER_GRAM.carbs) / nutrition.totalCalories;
    if (carbCalRatio > 0.7) {
      score -= PENALTIES.VERY_HIGH_CARB_RATIO;
      reasons.push('Carb ratio is very high');
    } else if (carbCalRatio > 0.6) {
      score -= PENALTIES.HIGH_CARB_RATIO;
      reasons.push('Carb ratio is high');
    }
  }

  // 4. High fat ratio penalty
  if (nutrition.totalCalories > 0) {
    const fatCalRatio =
      (nutrition.totalFats * CALS_PER_GRAM.fats) / nutrition.totalCalories;
    if (fatCalRatio > 0.5) {
      score -= PENALTIES.VERY_HIGH_FAT_RATIO;
      reasons.push('Fat ratio is very high');
    } else if (fatCalRatio > 0.4) {
      score -= PENALTIES.HIGH_FAT_RATIO;
      reasons.push('Fat ratio is high');
    }
  }

  // 5. Outside food penalty
  const outsideCount = entries.filter((e) => e.isOutsideFood).length;
  if (outsideCount > 0) {
    const penalty = Math.min(
      outsideCount * PENALTIES.OUTSIDE_FOOD_PER_ITEM,
      PENALTIES.OUTSIDE_FOOD_MAX
    );
    score -= penalty;
    reasons.push(`${outsideCount} outside food item${outsideCount > 1 ? 's' : ''}`);
  }

  // Clamp score between 0 and 100
  const finalScore = clamp(score, 0, MAX_SCORE);
  const grade = scoreToGrade(finalScore);

  const explanation =
    reasons.length > 0
      ? reasons.join('. ') + '.'
      : 'Great job! Your nutrition is well-balanced.';

  return {
    value: finalScore,
    previousValue: previousScore,
    explanation,
    grade,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert a numeric score to a letter grade */
function scoreToGrade(score: number): ScoreGrade {
  if (score >= 81) return 'A';
  if (score >= 61) return 'B';
  if (score >= 41) return 'C';
  if (score >= 21) return 'D';
  return 'F';
}

/** Clamp a number between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
