import type {
  HealthScore,
  NutritionData,
  FoodLogEntry,
  ScoreGrade,
  Suggestion,
  SuggestionType,
} from '../types';

/**
 * Score service contains pure functions for computing the health score
 * and generating actionable suggestions based on nutritional data.
 */

// ─── Constants ───────────────────────────────────────────────────────────────

/** Recommended daily intake targets */
const DAILY_TARGETS = {
  calories: 2000,
  protein: 50,  // grams
  carbs: 250,   // grams
  fats: 65,     // grams
} as const;

/** Ideal macro ratio (percentage of calories) */
const IDEAL_MACRO_RATIO = {
  protein: 0.20, // 20% of calories from protein
  carbs: 0.50,   // 50% from carbs
  fats: 0.30,    // 30% from fats
} as const;

/** Score component weights (must sum to 1.0) */
const SCORE_WEIGHTS = {
  macroBalance: 0.40,
  calorieAdherence: 0.35,
  outsideFoodPenalty: 0.25,
} as const;

/** Calorie-per-gram multipliers for macros */
const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fats: 9,
} as const;

/** Maximum penalty for outside food (percentage of entries) */
const OUTSIDE_FOOD_THRESHOLD = 0.5;

// ─── Score Calculation ───────────────────────────────────────────────────────

/**
 * Calculate the overall health score (0–100) based on the day's nutrition.
 *
 * The score is composed of three weighted factors:
 * 1. Macro balance (40%): How close macro ratios are to the ideal
 * 2. Calorie adherence (35%): How close total calories are to target
 * 3. Outside food penalty (25%): Penalty for high proportion of outside food
 *
 * @param nutrition - Aggregated daily nutrition data
 * @param entries - Individual food log entries (used for outside food detection)
 * @returns HealthScore with value, explanation, and letter grade
 */
export function calculateHealthScore(
  nutrition: NutritionData,
  entries: FoodLogEntry[]
): HealthScore {
  // Handle edge case: no food logged
  if (entries.length === 0) {
    return {
      value: 0,
      explanation: 'No food logged yet. Start tracking to see your score!',
      grade: 'F',
    };
  }

  const macroScore = calculateMacroBalanceScore(nutrition);
  const calorieScore = calculateCalorieAdherenceScore(nutrition.totalCalories);
  const outsidePenalty = calculateOutsideFoodPenalty(entries);

  const rawScore =
    macroScore * SCORE_WEIGHTS.macroBalance +
    calorieScore * SCORE_WEIGHTS.calorieAdherence +
    outsidePenalty * SCORE_WEIGHTS.outsideFoodPenalty;

  const value = Math.round(Math.max(0, Math.min(100, rawScore)));
  const grade = scoreToGrade(value);
  const explanation = buildExplanation(macroScore, calorieScore, outsidePenalty, nutrition);

  return { value, explanation, grade };
}

/**
 * Score macro balance by how close actual ratios are to ideal.
 * Returns 0–100.
 */
function calculateMacroBalanceScore(nutrition: NutritionData): number {
  const { totalProtein, totalCarbs, totalFats, totalCalories } = nutrition;

  if (totalCalories === 0) return 0;

  // Calculate actual macro calorie contributions
  const proteinCals = totalProtein * CALORIES_PER_GRAM.protein;
  const carbsCals = totalCarbs * CALORIES_PER_GRAM.carbs;
  const fatsCals = totalFats * CALORIES_PER_GRAM.fats;
  const totalMacroCals = proteinCals + carbsCals + fatsCals;

  if (totalMacroCals === 0) return 0;

  // Calculate actual ratios
  const actualRatios = {
    protein: proteinCals / totalMacroCals,
    carbs: carbsCals / totalMacroCals,
    fats: fatsCals / totalMacroCals,
  };

  // Calculate deviation from ideal (lower is better)
  const deviation =
    Math.abs(actualRatios.protein - IDEAL_MACRO_RATIO.protein) +
    Math.abs(actualRatios.carbs - IDEAL_MACRO_RATIO.carbs) +
    Math.abs(actualRatios.fats - IDEAL_MACRO_RATIO.fats);

  // Max possible deviation is ~2.0, normalize to 0-100
  return Math.max(0, 100 - deviation * 100);
}

/**
 * Score calorie adherence by how close intake is to the daily target.
 * Returns 0–100. Both under- and over-eating are penalized.
 */
function calculateCalorieAdherenceScore(totalCalories: number): number {
  const ratio = totalCalories / DAILY_TARGETS.calories;
  // Ideal ratio is 1.0; penalize deviation in both directions
  const deviation = Math.abs(1 - ratio);
  return Math.max(0, 100 - deviation * 100);
}

/**
 * Calculate a score component for outside food consumption.
 * More outside food = lower score. Returns 0–100.
 */
function calculateOutsideFoodPenalty(entries: FoodLogEntry[]): number {
  if (entries.length === 0) return 100;

  const outsideCount = entries.filter(
    (e) => e.foodItem.category === 'outside' || e.foodItem.category === 'snack'
  ).length;

  const outsideRatio = outsideCount / entries.length;

  if (outsideRatio >= OUTSIDE_FOOD_THRESHOLD) {
    return 0;
  }

  return Math.round(100 * (1 - outsideRatio / OUTSIDE_FOOD_THRESHOLD));
}

/** Build a human-readable explanation from the score components */
function buildExplanation(
  macroScore: number,
  calorieScore: number,
  outsideScore: number,
  nutrition: NutritionData
): string {
  const parts: string[] = [];

  if (macroScore >= 70) {
    parts.push('Good macro balance');
  } else if (macroScore >= 40) {
    parts.push('Macro balance needs improvement');
  } else {
    parts.push('Poor macro balance');
  }

  if (calorieScore >= 70) {
    parts.push('calorie intake is on target');
  } else if (nutrition.totalCalories > DAILY_TARGETS.calories) {
    parts.push('calorie intake is above target');
  } else {
    parts.push('calorie intake is below target');
  }

  if (outsideScore < 50) {
    parts.push('too much outside/snack food');
  }

  return parts.join(', ') + '.';
}

/** Convert a numeric score (0–100) to a letter grade */
function scoreToGrade(score: number): ScoreGrade {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

// ─── Suggestion Engine ───────────────────────────────────────────────────────

/**
 * Generate a single actionable suggestion based on the current nutrition data.
 * Prioritizes the most impactful deficiency.
 *
 * @param nutrition - Aggregated daily nutrition
 * @param entries - Food log entries for category analysis
 * @returns A single Suggestion with message and priority
 */
export function generateSuggestion(
  nutrition: NutritionData,
  entries: FoodLogEntry[]
): Suggestion {
  // No entries → generic prompt
  if (entries.length === 0) {
    return {
      type: 'good_balance',
      message: 'Start logging your meals to get personalized suggestions!',
      priority: 'low',
    };
  }

  // Rank potential suggestions by priority
  const candidates = getSuggestionCandidates(nutrition, entries);

  // Return the highest priority suggestion
  return candidates.length > 0
    ? candidates[0]
    : {
        type: 'good_balance',
        message: 'Great job! Your nutrition looks well-balanced today. Keep it up! 🎉',
        priority: 'low',
      };
}

/** Evaluate all possible suggestions and return sorted by priority */
function getSuggestionCandidates(
  nutrition: NutritionData,
  entries: FoodLogEntry[]
): Suggestion[] {
  const candidates: Suggestion[] = [];
  const { totalCalories, totalProtein, totalCarbs, totalFats } = nutrition;

  // Check protein deficiency
  const proteinRatio = totalProtein / Math.max(DAILY_TARGETS.protein, 1);
  if (proteinRatio < 0.5) {
    candidates.push(makeSuggestion(
      'low_protein',
      `Your protein intake is low (${Math.round(totalProtein)}g / ${DAILY_TARGETS.protein}g target). Try adding eggs, chicken, dal, or paneer.`,
      'high'
    ));
  }

  // Check excessive carbs
  if (totalCalories > 0) {
    const carbCalRatio = (totalCarbs * CALORIES_PER_GRAM.carbs) / totalCalories;
    if (carbCalRatio > 0.65) {
      candidates.push(makeSuggestion(
        'high_carbs',
        `Carbs make up ${Math.round(carbCalRatio * 100)}% of your calories. Balance with more protein and healthy fats.`,
        'high'
      ));
    }
  }

  // Check excessive fats
  if (totalCalories > 0) {
    const fatCalRatio = (totalFats * CALORIES_PER_GRAM.fats) / totalCalories;
    if (fatCalRatio > 0.40) {
      candidates.push(makeSuggestion(
        'high_fats',
        `Fat intake is high (${Math.round(fatCalRatio * 100)}% of calories). Consider lighter cooking methods or leaner options.`,
        'medium'
      ));
    }
  }

  // Check calorie excess
  if (totalCalories > DAILY_TARGETS.calories * 1.2) {
    candidates.push(makeSuggestion(
      'high_calories',
      `You've exceeded your calorie target by ${Math.round(totalCalories - DAILY_TARGETS.calories)} kcal. Consider lighter portions for remaining meals.`,
      'high'
    ));
  }

  // Check very low calorie intake (if they've logged multiple items)
  if (entries.length >= 3 && totalCalories < DAILY_TARGETS.calories * 0.4) {
    candidates.push(makeSuggestion(
      'low_calories',
      `Your calorie intake seems quite low (${Math.round(totalCalories)} kcal). Make sure you're eating enough for sustained energy.`,
      'medium'
    ));
  }

  // Check outside food proportion
  const outsideCount = entries.filter(
    (e) => e.foodItem.category === 'outside'
  ).length;
  if (outsideCount >= 2 || (entries.length > 0 && outsideCount / entries.length > 0.4)) {
    candidates.push(makeSuggestion(
      'too_much_outside_food',
      'You have quite a bit of outside food today. Try preparing one meal at home for better nutrition control.',
      'medium'
    ));
  }

  // Check for missing vegetables
  const hasVegetable = entries.some(
    (e) => e.foodItem.category === 'vegetable' || e.foodItem.category === 'fruit'
  );
  if (!hasVegetable && entries.length >= 2) {
    candidates.push(makeSuggestion(
      'missing_vegetables',
      'No fruits or vegetables logged yet. Add a salad or fruit to improve your micronutrient intake.',
      'medium'
    ));
  }

  // Sort: high > medium > low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return candidates.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

/** Helper to create a Suggestion object */
function makeSuggestion(
  type: SuggestionType,
  message: string,
  priority: Suggestion['priority']
): Suggestion {
  return { type, message, priority };
}
