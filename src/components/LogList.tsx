import type { FoodLogEntry } from '../types';

/**
 * LogList Component
 *
 * Displays today's food log entries with the ability to remove items.
 * Entries are shown in reverse chronological order (newest first).
 */

interface LogListProps {
  entries: FoodLogEntry[];
  onRemoveEntry: (entryId: string) => void;
  onClearAll: () => void;
}

export default function LogList({ entries, onRemoveEntry, onClearAll }: LogListProps) {
  if (entries.length === 0) {
    return (
      <div className="log-list-empty">
        <p className="log-empty-text">No food logged yet today. Start above!</p>
      </div>
    );
  }

  return (
    <div className="log-list-container" id="food-log">
      <div className="log-header">
        <h3 className="log-title">
          Today's Log
          <span className="log-count">{entries.length}</span>
        </h3>
        <button
          className="log-clear-btn"
          onClick={onClearAll}
          aria-label="Clear all entries"
        >
          Clear All
        </button>
      </div>

      <ul className="log-list" role="list">
        {[...entries].reverse().map((entry) => (
          <li key={entry.id} className="log-item">
            <div className="log-item-info">
              <span className="log-item-name">
                {entry.quantity}× {entry.foodItem.name}
                {entry.isOutsideFood && (
                  <span className="outside-badge" title="Outside food">🍔</span>
                )}
              </span>
              <span className="log-item-cals">
                {Math.round(entry.foodItem.calories * entry.quantity)} kcal
              </span>
            </div>
            <button
              className="log-item-remove"
              onClick={() => onRemoveEntry(entry.id)}
              aria-label={`Remove ${entry.foodItem.name}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
