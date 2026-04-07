import type { NutritionData, FoodLogEntry, Suggestion, SuggestionType } from '../types';

/**
 * SUGGESTION ENGINE
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  WHY ONLY ONE SUGGESTION?                                          │
 * │                                                                     │
 * │  Behavioral science shows that giving people too many choices       │
 * │  leads to "decision paralysis" (Schwartz, Paradox of Choice).      │
 * │                                                                     │
 * │  By returning EXACTLY ONE actionable suggestion, we:                │
 * │  1. Eliminate cognitive overload                                     │
 * │  2. Create a clear "next action" for the user                       │
 * │  3. Increase the chance the user actually follows through           │
 * │                                                                     │
 * │  The suggestion is ranked by severity — the most impactful          │
 * │  issue is surfaced first.                                           │
 * └─────────────────────────────────────────────────────────────────────┘
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const DAILY_TARGETS = {
  calories: 2000,
  protein: 50,
} as const;

const CALS_PER_GRAM = { protein: 4, carbs: 4, fats: 9 } as const;

/** Threshold ratios for detecting macro imbalances */
const THRESHOLDS = {
  LOW_PROTEIN_RATIO: 0.5,
  HIGH_CARB_CALORIE_RATIO: 0.60,
  HIGH_FAT_CALORIE_RATIO: 0.40,
  EXCESS_CALORIE_RATIO: 1.2,
  OUTSIDE_FOOD_COUNT: 2,
} as const;

// ─── Main Function ───────────────────────────────────────────────────────────

/**
 * Generate a SINGLE actionable suggestion based on current nutrition.
 *
 * Evaluates multiple potential issues, ranks them by severity,
 * and returns only the most impactful one.
 *
 * @param nutrition - Aggregated daily nutrition data
 * @param entries - Food log entries (for category analysis)
 * @returns A single Suggestion object
 */
export function generateSuggestion(
  nutrition: NutritionData,
  entries: FoodLogEntry[]
): Suggestion {
  // No food logged — encourage user to start
  if (entries.length === 0) {
    return makeSuggestion(
      'good_balance',
      'Log your first meal to get a personalized insight!',
      '🍽️'
    );
  }

  // Collect all potential issues, ranked by severity (highest first)
  const candidates = evaluateDeficiencies(nutrition, entries);

  // Return the highest-severity issue, or a positive message
  return candidates.length > 0
    ? candidates[0]
    : makeSuggestion(
        'good_balance',
        'Great job! Your nutrition looks well-balanced today. Keep it up!',
        '🎉'
      );
}

// ─── Deficiency Evaluation ───────────────────────────────────────────────────

/**
 * Evaluate all potential nutritional issues and return them
 * sorted by severity (most critical first).
 */
function evaluateDeficiencies(
  nutrition: NutritionData,
  entries: FoodLogEntry[]
): Suggestion[] {
  const issues: Array<Suggestion & { severity: number }> = [];
  const { totalCalories, totalProtein, totalCarbs, totalFats } = nutrition;

  // Check: Low protein
  const proteinRatio = totalProtein / DAILY_TARGETS.protein;
  if (proteinRatio < THRESHOLDS.LOW_PROTEIN_RATIO) {
    issues.push({
      severity: 90,
      ...makeSuggestion(
        'low_protein',
        `Protein is at ${Math.round(totalProtein)}g (target: ${DAILY_TARGETS.protein}g). Add eggs, chicken, dal, or paneer to your next meal.`,
        '💪'
      ),
    });
  }

  // Check: Excess calories
  if (totalCalories > DAILY_TARGETS.calories * THRESHOLDS.EXCESS_CALORIE_RATIO) {
    issues.push({
      severity: 85,
      ...makeSuggestion(
        'high_calories',
        `You've exceeded your calorie target by ${Math.round(totalCalories - DAILY_TARGETS.calories)} kcal. Go lighter on your remaining meals.`,
        '🔥'
      ),
    });
  }

  // Check: High carb ratio
  if (totalCalories > 0) {
    const carbRatio = (totalCarbs * CALS_PER_GRAM.carbs) / totalCalories;
    if (carbRatio > THRESHOLDS.HIGH_CARB_CALORIE_RATIO) {
      issues.push({
        severity: 75,
        ...makeSuggestion(
          'high_carbs',
          `Carbs make up ${Math.round(carbRatio * 100)}% of your calories. Balance with protein-rich foods.`,
          '🍞'
        ),
      });
    }
  }

  // Check: High fat ratio
  if (totalCalories > 0) {
    const fatRatio = (totalFats * CALS_PER_GRAM.fats) / totalCalories;
    if (fatRatio > THRESHOLDS.HIGH_FAT_CALORIE_RATIO) {
      issues.push({
        severity: 70,
        ...makeSuggestion(
          'high_fats',
          `Fat is ${Math.round(fatRatio * 100)}% of your calories. Try grilled or steamed options instead.`,
          '🧈'
        ),
      });
    }
  }

  // Check: Too much outside food
  const outsideCount = entries.filter((e) => e.isOutsideFood).length;
  if (outsideCount >= THRESHOLDS.OUTSIDE_FOOD_COUNT) {
    issues.push({
      severity: 65,
      ...makeSuggestion(
        'too_much_outside_food',
        'Multiple outside food items today. Try preparing one meal at home for better nutrition control.',
        '🏠'
      ),
    });
  }

  // Check: Missing vegetables/fruits
  const hasProduceEntry = entries.some(
    (e) => e.foodItem.category === 'vegetable' || e.foodItem.category === 'fruit'
  );
  if (!hasProduceEntry && entries.length >= 2) {
    issues.push({
      severity: 55,
      ...makeSuggestion(
        'missing_vegetables',
        'No fruits or vegetables yet. A quick salad or fruit can boost your micronutrients.',
        '🥗'
      ),
    });
  }

  // Sort by severity (highest first) and return
  return issues.sort((a, b) => b.severity - a.severity);
}

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Create a Suggestion object */
function makeSuggestion(
  type: SuggestionType,
  message: string,
  icon: string
): Suggestion {
  return { type, message, icon };
}
