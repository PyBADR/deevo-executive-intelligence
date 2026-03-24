"use client";

/**
 * KPI Card — Single executive KPI with trend indicator.
 *
 * Maps to: ExecutiveKPI from /kpis/{scenario_id}
 */

interface KPICardProps {
  name: string;
  value: number;
  unit: string;
  trend: { direction: "up" | "down" | "stable"; change_pct: number };
  category: string;
  explanation?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  economic: "text-blue-400",
  risk: "text-red-400",
  opportunity: "text-emerald-400",
  governance: "text-violet-400",
  infrastructure: "text-amber-400",
  financial: "text-cyan-400",
};

const TREND_ICONS: Record<string, string> = {
  up: "↑",
  down: "↓",
  stable: "→",
};

const TREND_COLORS: Record<string, string> = {
  up: "text-red-400",
  down: "text-emerald-400",
  stable: "text-deevo-text-muted",
};

export function KPICard({ name, value, unit, trend, category, explanation }: KPICardProps) {
  return (
    <div className="exec-card rounded-xl bg-deevo-surface p-5">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-medium uppercase tracking-wider ${CATEGORY_COLORS[category] || "text-deevo-text-muted"}`}>
          {category}
        </span>
        <span className={`text-sm font-mono ${TREND_COLORS[trend.direction]}`}>
          {TREND_ICONS[trend.direction]} {Math.abs(trend.change_pct).toFixed(1)}%
        </span>
      </div>

      <div className="mb-2">
        <span className="text-3xl font-semibold tabular-nums">{value.toFixed(1)}</span>
        <span className="text-sm text-deevo-text-muted ml-1">{unit}</span>
      </div>

      <div className="text-sm text-deevo-text-secondary">{name}</div>

      {explanation && (
        <div className="mt-3 text-xs text-deevo-text-muted leading-relaxed border-t border-deevo-border pt-3">
          {explanation}
        </div>
      )}
    </div>
  );
}
