import FoodInput from './components/FoodInput';
import HealthCard from './components/HealthCard';
import Heatmap from './components/Heatmap';
import SuggestionCard from './components/SuggestionCard';
import { useHealthData } from './hooks/useHealthData';
import { formatDateForDisplay } from './utils/helpers';

/**
 * Root application component for NutriTrack.
 * Composes all feature components and orchestrates the layout.
 * All business logic is delegated to the useHealthData hook.
 */
export default function App() {
  const {
    todayEntries,
    todayNutrition,
    todayScore,
    suggestion,
    heatmapData,
    todayDate,
    addFoodEntry,
    removeFoodEntry,
    clearToday,
  } = useHealthData();

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header" role="banner">
        <div className="header-content">
          <div className="header-brand">
            <span className="header-icon" aria-hidden="true">🥗</span>
            <h1 className="header-title">NutriTrack</h1>
          </div>
          <p className="header-subtitle">
            Behavior-Driven Nutrition · {formatDateForDisplay(todayDate)}
          </p>
        </div>
      </header>

      <main className="app-main" role="main">
        {/* Food Input Section */}
        <section className="section food-input-section" aria-label="Log food">
          <h2 className="section-title">Log Your Food</h2>
          <p className="section-description">
            Type a food with quantity (e.g., "2 sandwich" or "apple") to track your intake.
          </p>
          <FoodInput onAddFood={addFoodEntry} />
        </section>

        {/* Two-column layout: Score + Suggestion */}
        <div className="dashboard-grid">
          {/* Health Score & Nutrition */}
          <section className="section" aria-label="Health score and nutrition">
            <h2 className="section-title">Health Score</h2>
            <HealthCard
              score={todayScore}
              nutrition={todayNutrition}
              entries={todayEntries}
              onClearToday={clearToday}
            />
          </section>

          {/* Suggestion + Food Log */}
          <div className="sidebar-stack">
            <section className="section" aria-label="Nutrition suggestion">
              <h2 className="section-title">Smart Insight</h2>
              <SuggestionCard suggestion={suggestion} />
            </section>

            {/* Today's Food Log */}
            {todayEntries.length > 0 && (
              <section className="section food-log-section" aria-label="Today's food log">
                <h2 className="section-title">
                  Today's Log
                  <span className="entry-count-badge">{todayEntries.length}</span>
                </h2>
                <ul className="food-log-list" role="list">
                  {todayEntries.map((entry) => (
                    <li key={entry.id} className="food-log-item">
                      <div className="food-log-info">
                        <span className="food-log-name">
                          {entry.quantity}× {entry.foodItem.name}
                        </span>
                        <span className="food-log-calories">
                          {Math.round(entry.foodItem.calories * entry.quantity)} kcal
                        </span>
                      </div>
                      <button
                        className="food-log-remove"
                        onClick={() => removeFoodEntry(entry.id)}
                        aria-label={`Remove ${entry.foodItem.name}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {/* Heatmap Section */}
        <section className="section heatmap-section" aria-label="Health heatmap">
          <Heatmap data={heatmapData} />
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer" role="contentinfo">
        <p>NutriTrack — Built with ❤️ for healthier choices</p>
      </footer>
    </div>
  );
}
