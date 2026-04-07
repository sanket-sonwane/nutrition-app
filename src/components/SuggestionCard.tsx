import type { Suggestion } from '../types';

/**
 * SuggestionCard displays a single actionable nutrition suggestion.
 * The visual style adapts based on the priority level.
 */

interface SuggestionCardProps {
  suggestion: Suggestion;
}

/** Icon and accent color mapped to priority level */
const PRIORITY_STYLES: Record<
  Suggestion['priority'],
  { icon: string; accentColor: string; bgGradient: string }
> = {
  high: {
    icon: '⚡',
    accentColor: '#f97316',
    bgGradient: 'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(239,68,68,0.08) 100%)',
  },
  medium: {
    icon: '💡',
    accentColor: '#facc15',
    bgGradient: 'linear-gradient(135deg, rgba(250,204,21,0.12) 0%, rgba(251,146,60,0.08) 100%)',
  },
  low: {
    icon: '✅',
    accentColor: '#10b981',
    bgGradient: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(34,211,238,0.08) 100%)',
  },
};

/** Label text for priority badges */
const PRIORITY_LABELS: Record<Suggestion['priority'], string> = {
  high: 'Important',
  medium: 'Tip',
  low: 'Looking Good',
};

export default function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const style = PRIORITY_STYLES[suggestion.priority];

  return (
    <div
      className="suggestion-card"
      id="suggestion-card"
      style={{
        background: style.bgGradient,
        borderLeft: `3px solid ${style.accentColor}`,
      }}
      role="status"
      aria-label="Nutrition suggestion"
    >
      <div className="suggestion-header">
        <span className="suggestion-icon" aria-hidden="true">
          {style.icon}
        </span>
        <span
          className="suggestion-priority-badge"
          style={{ color: style.accentColor }}
        >
          {PRIORITY_LABELS[suggestion.priority]}
        </span>
      </div>
      <p className="suggestion-message">{suggestion.message}</p>
    </div>
  );
}
