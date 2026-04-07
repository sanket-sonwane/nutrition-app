import type { NutritionData, HealthScore, FoodLogEntry } from '../types';
import { formatNumber } from '../utils/helpers';

/**
 * HealthCard displays the current health score alongside
 * a nutrition breakdown with visual macro bars.
 */

interface HealthCardProps {
  score: HealthScore;
  nutrition: NutritionData;
  entries: FoodLogEntry[];
  onClearToday: () => void;
}

/** Color map for score grades */
const GRADE_COLORS: Record<string, string> = {
  A: '#10b981', // emerald
  B: '#22d3ee', // cyan
  C: '#facc15', // yellow
  D: '#fb923c', // orange
  F: '#ef4444', // red
};

/** Recommended daily targets for macro bars */
const DAILY_TARGETS = {
  calories: 2000,
  protein: 50,
  carbs: 250,
  fats: 65,
} as const;

export default function HealthCard({
  score,
  nutrition,
  entries,
  onClearToday,
}: HealthCardProps) {
  const gradeColor = GRADE_COLORS[score.grade] ?? GRADE_COLORS.F;
  const hasEntries = entries.length > 0;

  return (
    <div className="health-card" id="health-score-card">
      {/* Score circle */}
      <div className="score-section">
        <div
          className="score-circle"
          style={{
            borderColor: gradeColor,
            boxShadow: `0 0 24px ${gradeColor}33, 0 0 48px ${gradeColor}11`,
          }}
        >
          <span className="score-value" style={{ color: gradeColor }}>
            {score.value}
          </span>
          <span className="score-label">/ 100</span>
        </div>
        <div className="grade-badge" style={{ backgroundColor: gradeColor }}>
          Grade {score.grade}
        </div>
        <p className="score-explanation">{score.explanation}</p>
      </div>

      {/* Nutrition breakdown */}
      <div className="nutrition-section">
        <h3 className="nutrition-title">Today's Nutrition</h3>

        <div className="macro-grid">
          <MacroBar
            label="Calories"
            value={nutrition.totalCalories}
            target={DAILY_TARGETS.calories}
            unit="kcal"
            color="#f97316"
          />
          <MacroBar
            label="Protein"
            value={nutrition.totalProtein}
            target={DAILY_TARGETS.protein}
            unit="g"
            color="#8b5cf6"
          />
          <MacroBar
            label="Carbs"
            value={nutrition.totalCarbs}
            target={DAILY_TARGETS.carbs}
            unit="g"
            color="#3b82f6"
          />
          <MacroBar
            label="Fats"
            value={nutrition.totalFats}
            target={DAILY_TARGETS.fats}
            unit="g"
            color="#ec4899"
          />
        </div>

        {hasEntries && (
          <div className="entries-summary">
            <span className="entries-count">{entries.length} item{entries.length !== 1 ? 's' : ''} logged</span>
            <button
              id="clear-today-btn"
              onClick={onClearToday}
              className="clear-button"
              aria-label="Clear all entries for today"
            >
              Clear Day
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MacroBar Sub-component ──────────────────────────────────────────────────

interface MacroBarProps {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}

/**
 * A single macro nutrient progress bar.
 * Shows current value vs daily target with a filled bar.
 */
function MacroBar({ label, value, target, unit, color }: MacroBarProps) {
  const percentage = Math.min((value / target) * 100, 100);
  const isOver = value > target;

  return (
    <div className="macro-bar-container">
      <div className="macro-bar-header">
        <span className="macro-bar-label">{label}</span>
        <span className="macro-bar-value">
          {formatNumber(value)}
          <span className="macro-bar-unit"> / {formatNumber(target)} {unit}</span>
        </span>
      </div>
      <div className="macro-bar-track">
        <div
          className={`macro-bar-fill ${isOver ? 'over' : ''}`}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}44`,
          }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={target}
          aria-label={`${label}: ${formatNumber(value)} of ${formatNumber(target)} ${unit}`}
        />
      </div>
    </div>
  );
}
