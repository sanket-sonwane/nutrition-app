import FoodInput from './components/FoodInput';
import HealthScoreCard from './components/HealthScoreCard';
import Heatmap from './components/Heatmap';
import SuggestionCard from './components/SuggestionCard';
import LogList from './components/LogList';
import { useHealthData } from './hooks/useHealthData';

/**
 * App — Root Component
 *
 * LAYOUT DESIGN (top to bottom):
 * 1. HERO: Large health score (visually dominant, anchors attention)
 * 2. MIDDLE: Food input + outside food toggle (action area)
 * 3. BELOW: One smart suggestion (behavioral nudge)
 * 4. LOG: Today's food entries
 * 5. BOTTOM: Full-width heatmap — "Your Habit Journey"
 *
 * UI PHILOSOPHY:
 * The layout is designed for decision-making clarity.
 * Every section has a single purpose, and the visual hierarchy
 * guides the user's eyes from "current state" (score) →
 * "action" (input) → "guidance" (suggestion) → "progress" (heatmap).
 *
 * All business logic is delegated to the useHealthData hook.
 * This component is purely presentational + compositional.
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

  /** Format today's date for display */
  const displayDate = new Date(todayDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="app-shell">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <header className="app-header" role="banner">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-icon" aria-hidden="true">🥗</span>
            <h1 className="brand-name">NutriTrack</h1>
          </div>
          <p className="header-date">{displayDate}</p>
        </div>
      </header>

      <main className="app-main" role="main">
        {/* ─── 1. HERO: Health Score ─────────────────────────────── */}
        <section className="hero-section" aria-label="Health score">
          <HealthScoreCard score={todayScore} nutrition={todayNutrition} />
        </section>

        {/* ─── 2. MIDDLE: Food Input ─────────────────────────────── */}
        <section className="input-section" aria-label="Log food">
          <h2 className="section-heading">Log Your Meal</h2>
          <FoodInput onAddFood={addFoodEntry} />
        </section>

        {/* ─── 3. BELOW: Smart Suggestion ────────────────────────── */}
        <section className="suggestion-section" aria-label="Nutrition insight">
          <SuggestionCard suggestion={suggestion} />
        </section>

        {/* ─── 4. LOG: Today's Entries ────────────────────────────── */}
        <section className="log-section" aria-label="Today's food log">
          <LogList
            entries={todayEntries}
            onRemoveEntry={removeFoodEntry}
            onClearAll={clearToday}
          />
        </section>

        {/* ─── 5. BOTTOM: Heatmap ────────────────────────────────── */}
        <section className="heatmap-section" aria-label="Habit journey heatmap">
          <Heatmap data={heatmapData} />
        </section>
      </main>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="app-footer" role="contentinfo">
        <p>NutriTrack — Building healthier habits, one meal at a time</p>
      </footer>
    </div>
  );
}
