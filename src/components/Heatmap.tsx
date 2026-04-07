import type { HeatmapDay } from '../types';

/**
 * Heatmap Component — "Your Habit Journey"
 *
 * A 30-day calendar heatmap showing daily health scores.
 * This is a KEY FEATURE for behavior reinforcement — seeing
 * colors trend from red → yellow → green provides powerful
 * visual proof that habits are improving.
 *
 * Color mapping (deliberately simple for instant understanding):
 * - 0–50  → Red (needs improvement)
 * - 51–80 → Yellow (getting better)
 * - 81–100 → Green (excellent)
 * - 0 (no data) → Gray
 */

interface HeatmapProps {
  data: HeatmapDay[];
}

/** Map score to the three-tier color scheme */
function getColor(score: number): string {
  if (score === 0) return '#1e293b';    // No data — subtle gray
  if (score <= 50) return '#ef4444';     // Red
  if (score <= 80) return '#facc15';     // Yellow
  return '#10b981';                       // Green
}

/** Format date string to short display (e.g., "Apr 7") */
function formatShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Get short weekday label */
function getDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export default function Heatmap({ data }: HeatmapProps) {
  // Split into rows of 7 (weeks)
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <div className="heatmap-container" id="heatmap-section">
      <h2 className="heatmap-title">Your Habit Journey</h2>
      <p className="heatmap-subtitle">30 days of nutrition scores — watch your progress unfold</p>

      <div className="heatmap-grid" role="grid" aria-label="30-day health score heatmap">
        {weeks.map((week, wi) => (
          <div key={wi} className="heatmap-week" role="row">
            {week.map((day) => (
              <div key={day.date} className="heatmap-cell-wrap" role="gridcell">
                <div
                  className="heatmap-cell"
                  style={{
                    backgroundColor: getColor(day.score),
                    boxShadow: day.score > 0 ? `0 0 8px ${getColor(day.score)}33` : 'none',
                  }}
                  title={`${formatShort(day.date)}: ${day.score > 0 ? `Score ${day.score}` : 'No data'}`}
                  aria-label={`${formatShort(day.date)}: Score ${day.score}`}
                />
                <span className="heatmap-day-text">{getDay(day.date)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="heatmap-legend" aria-label="Color legend">
        <span className="legend-text">Needs work</span>
        <div className="legend-swatches">
          <div className="legend-swatch" style={{ backgroundColor: '#ef4444' }} />
          <div className="legend-swatch" style={{ backgroundColor: '#facc15' }} />
          <div className="legend-swatch" style={{ backgroundColor: '#10b981' }} />
        </div>
        <span className="legend-text">Excellent</span>
      </div>
    </div>
  );
}
