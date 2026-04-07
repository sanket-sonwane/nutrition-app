import type { Suggestion } from '../types';

/**
 * SuggestionCard Component
 *
 * Displays a SINGLE actionable nutrition suggestion.
 *
 * BEHAVIORAL DESIGN:
 * Only one suggestion is shown at a time to avoid cognitive overload.
 * Research shows that a single clear action is far more likely to be
 * acted upon than a list of recommendations (Paradox of Choice).
 */

interface SuggestionCardProps {
  suggestion: Suggestion;
}

export default function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const isPositive = suggestion.type === 'good_balance';

  return (
    <div
      className={`suggestion-card ${isPositive ? 'positive' : 'actionable'}`}
      id="suggestion-card"
      role="status"
      aria-label="Nutrition suggestion"
    >
      <span className="suggestion-icon" aria-hidden="true">
        {suggestion.icon}
      </span>
      <div className="suggestion-content">
        <span className="suggestion-label">
          {isPositive ? 'Looking Good' : 'Quick Tip'}
        </span>
        <p className="suggestion-message">{suggestion.message}</p>
      </div>
    </div>
  );
}
