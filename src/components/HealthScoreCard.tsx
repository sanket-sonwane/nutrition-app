import type { HealthScore, NutritionData } from '../types';

/**
 * HealthScoreCard Component
 *
 * The HERO section of the app — the health score is the most
 * visually dominant element to anchor the user's attention.
 *
 * UI DESIGN PRINCIPLE:
 * This card focuses on simplicity and decision-making clarity.
 * The large score number + dynamic message gives the user an
 * instant understanding of their current nutritional state
 * without requiring them to interpret complex data.
 */

interface HealthScoreCardProps {
  score: HealthScore;
  nutrition: NutritionData;
}

// ─── Color mapping for score grades ──────────────────────────────────────────

const GRADE_STYLES: Record<string, { color: string; bg: string; glow: string }> = {
  A: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', glow: 'rgba(16,185,129,0.25)' },
  B: { color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', glow: 'rgba(34,211,238,0.25)' },
  C: { color: '#facc15', bg: 'rgba(250,204,21,0.1)', glow: 'rgba(250,204,21,0.25)' },
  D: { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', glow: 'rgba(251,146,60,0.25)' },
  F: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', glow: 'rgba(239,68,68,0.25)' },
};

/** Daily recommended targets for the macro summary */
const TARGETS = { calories: 2000, protein: 50, carbs: 250, fats: 65 } as const;

export default function HealthScoreCard({ score, nutrition }: HealthScoreCardProps) {
  const style = GRADE_STYLES[score.grade] ?? GRADE_STYLES.F;
  const hasChange = score.previousValue !== null && score.previousValue !== score.value;
  const scoreDelta = hasChange ? score.value - (score.previousValue ?? 0) : 0;

  return (
    <div className="health-score-card" id="health-score-card">
      {/* Large Score Display */}
      <div className="score-hero">
        <div
          className="score-ring"
          style={{
            borderColor: style.color,
            boxShadow: `0 0 40px ${style.glow}, 0 0 80px ${style.glow}`,
          }}
        >
          <span className="score-number" style={{ color: style.color }}>
            {score.value}
          </span>
          <span className="score-max">/ 100</span>
        </div>

        {/* Score change indicator */}
        {hasChange && (
          <div
            className={`score-delta ${scoreDelta >= 0 ? 'positive' : 'negative'}`}
            aria-label={`Score changed by ${scoreDelta > 0 ? '+' : ''}${scoreDelta}`}
          >
            {scoreDelta > 0 ? '↑' : '↓'} {Math.abs(scoreDelta)}
          </div>
        )}

        {/* Grade badge */}
        <div className="grade-pill" style={{ backgroundColor: style.color }}>
          Grade {score.grade}
        </div>

        {/* Dynamic explanation message */}
        <p className="score-message">{score.explanation}</p>
      </div>

      {/* Compact Macro Summary */}
      <div className="macro-summary">
        <MacroItem label="Calories" value={nutrition.totalCalories} target={TARGETS.calories} unit="kcal" />
        <MacroItem label="Protein" value={nutrition.totalProtein} target={TARGETS.protein} unit="g" />
        <MacroItem label="Carbs" value={nutrition.totalCarbs} target={TARGETS.carbs} unit="g" />
        <MacroItem label="Fats" value={nutrition.totalFats} target={TARGETS.fats} unit="g" />
      </div>
    </div>
  );
}

// ─── MacroItem sub-component ─────────────────────────────────────────────────

interface MacroItemProps {
  label: string;
  value: number;
  target: number;
  unit: string;
}

/** A single macro nutrient display with value/target */
function MacroItem({ label, value, target, unit }: MacroItemProps) {
  const pct = Math.min((value / target) * 100, 100);
  const isOver = value > target;

  return (
    <div className="macro-item">
      <div className="macro-label">{label}</div>
      <div className="macro-value">
        {Math.round(value)}
        <span className="macro-target"> / {target}{unit}</span>
      </div>
      <div className="macro-bar-track">
        <div
          className={`macro-bar-fill ${isOver ? 'over' : ''}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={target}
        />
      </div>
    </div>
  );
}
