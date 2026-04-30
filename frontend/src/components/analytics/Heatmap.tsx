import { useMemo } from "react";
import { motion } from "framer-motion";

interface HeatmapProps {
  data: { date: string; count: number }[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];

function getColor(count: number, max: number): string {
  if (count === 0) return "rgba(238,229,218,0.04)";
  const ratio = count / Math.max(max, 1);
  if (ratio <= 0.25) return "rgba(99,102,241,0.25)";
  if (ratio <= 0.5) return "rgba(99,102,241,0.45)";
  if (ratio <= 0.75) return "rgba(99,102,241,0.65)";
  return "rgba(99,102,241,0.9)";
}

export function Heatmap({ data }: HeatmapProps) {
  const { grid, monthLabels, maxCount, totalContributions } = useMemo(() => {
    const dataMap = new Map(data.map((d) => [d.date, d.count]));
    let max = 0;
    let total = 0;
    data.forEach((d) => {
      if (d.count > max) max = d.count;
      total += d.count;
    });

    // Build 52-week grid (7 rows × 52 cols)
    const today = new Date();
    const weeks: { date: string; count: number; dayOfWeek: number }[][] = [];
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    for (let w = 52; w >= 0; w--) {
      const week: { date: string; count: number; dayOfWeek: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const dayOffset = w * 7 + (6 - d);
        const cellDate = new Date(today);
        cellDate.setDate(cellDate.getDate() - dayOffset);
        const dateStr = cellDate.toISOString().split("T")[0];
        const count = dataMap.get(dateStr) || 0;
        week.push({ date: dateStr, count, dayOfWeek: cellDate.getDay() });

        // Track month transitions
        if (d === 0 && cellDate.getMonth() !== lastMonth) {
          lastMonth = cellDate.getMonth();
          labels.push({ month: MONTHS[cellDate.getMonth()], weekIndex: 52 - w });
        }
      }
      weeks.unshift(week);
    }

    return { grid: weeks, monthLabels: labels, maxCount: max, totalContributions: total };
  }, [data]);

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Task Completion Activity
        </h3>
        <span className="text-xs text-[var(--text-muted)]">
          {totalContributions} tasks completed in the last year
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-0.5 min-w-max">
          {/* Month labels */}
          <div className="flex ml-8 mb-1">
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="text-[10px] text-[var(--text-muted)]"
                style={{
                  position: "relative",
                  left: `${m.weekIndex * 13}px`,
                  width: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {m.month}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {DAYS.map((d, i) => (
                <span
                  key={i}
                  className="text-[9px] text-[var(--text-muted)] h-[11px] flex items-center justify-end pr-1 w-6"
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Cells */}
            {grid.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-0.5">
                {week.map((cell, dIdx) => (
                  <motion.div
                    key={cell.date}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: wIdx * 0.005 + dIdx * 0.01 }}
                    className="h-[11px] w-[11px] rounded-[2px] transition-colors cursor-pointer hover:ring-1 hover:ring-brand-400"
                    style={{ backgroundColor: getColor(cell.count, maxCount) }}
                    title={`${cell.date}: ${cell.count} task${cell.count !== 1 ? "s" : ""}`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1 mt-2 ml-8">
            <span className="text-[10px] text-[var(--text-muted)]">Less</span>
            {[0, 0.25, 0.5, 0.75, 1].map((r) => (
              <div
                key={r}
                className="h-[11px] w-[11px] rounded-[2px]"
                style={{ backgroundColor: getColor(r === 0 ? 0 : 1, r === 0 ? 1 : 1 / r) }}
              />
            ))}
            <span className="text-[10px] text-[var(--text-muted)]">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
