import type { HeatmapDay } from '../types';
import { getDayLabel, formatDateForDisplay } from '../utils/helpers';

/**
 * Heatmap component displays a 30-day grid of health scores.
 * Each cell is color-coded based on the daily score grade.
 *
 * Color mapping:
 * - 85+  (A): Green
 * - 70+  (B): Teal
 * - 55+  (C): Yellow
 * - 40+  (D): Orange
 * - <40  (F): Red
 * -  0   (no data): Gray
 */

interface HeatmapProps {
  data: HeatmapDay[];
}

/** Map score ranges to cell colors */
function getHeatmapColor(score: number): string {
  if (score === 0) return '#1e293b';  // slate-800 (no data)
  if (score >= 85) return '#10b981';   // emerald-500
  if (score >= 70) return '#22d3ee';   // cyan-400
  if (score >= 55) return '#facc15';   // yellow-400
  if (score >= 40) return '#fb923c';   // orange-400
  return '#ef4444';                     // red-500
}

export default function Heatmap({ data }: HeatmapProps) {
  // Split data into weeks (7-day rows) for grid layout
  const weeks = chunkArray(data, 7);

  return (
    <div className="heatmap-container" id="heatmap-section">
      <h3 className="heatmap-title">30-Day Health Heatmap</h3>
      <p className="heatmap-subtitle">Your daily health score history</p>

      <div className="heatmap-grid" role="grid" aria-label="30-day health score heatmap">
        {weeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            className="heatmap-row"
            role="row"
          >
            {week.map((day) => (
              <div
                key={day.date}
                className="heatmap-cell-wrapper"
                role="gridcell"
              >
                <div
                  className="heatmap-cell"
                  style={{
                    backgroundColor: getHeatmapColor(day.score),
                    boxShadow: day.score > 0
                      ? `0 0 6px ${getHeatmapColor(day.score)}44`
                      : 'none',
                  }}
                  title={`${formatDateForDisplay(day.date)}: Score ${day.score} (${day.grade})`}
                  aria-label={`${formatDateForDisplay(day.date)}: Score ${day.score}, Grade ${day.grade}`}
                />
                <span className="heatmap-day-label">
                  {getDayLabel(day.date)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="heatmap-legend" aria-label="Score color legend">
        <span className="legend-label">Worse</span>
        <div className="legend-colors">
          {['#ef4444', '#fb923c', '#facc15', '#22d3ee', '#10b981'].map(
            (color) => (
              <div
                key={color}
                className="legend-swatch"
                style={{ backgroundColor: color }}
              />
            )
          )}
        </div>
        <span className="legend-label">Better</span>
      </div>
    </div>
  );
}

/** Split an array into chunks of a given size */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
