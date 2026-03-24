"use client";

/**
 * KpiStrip — Top 5 executive KPIs, sorted by magnitude of movement.
 *
 * Visual Design:
 *   - Large metric typography (text-display class)
 *   - Color-coded delta with directional arrow
 *   - Category accent border-left
 *   - Previous value shown for context
 *   - Breathing room between cards
 *
 * Data: snapshot.kpi_dashboard.executive_kpis
 */

import type { ExecutiveKPI } from "@/types/kpi";

interface KpiStripProps {
  kpis: ExecutiveKPI[];
  loading?: boolean;
}

const CATEGORY_ACCENT: Record<string, { border: string; label: string; glow: string }> = {
  economic:       { border: "border-l-blue-500",    label: "text-blue-400",    glow: "hover:shadow-glow-blue" },
  risk:           { border: "border-l-red-500",     label: "text-red-400",     glow: "hover:shadow-glow-red" },
  opportunity:    { border: "border-l-emerald-500", label: "text-emerald-400", glow: "" },
  governance:     { border: "border-l-violet-500",  label: "text-violet-400",  glow: "" },
  infrastructure: { border: "border-l-amber-500",   label: "text-amber-400",   glow: "hover:shadow-glow-gold" },
  financial:      { border: "border-l-cyan-500",    label: "text-cyan-400",    glow: "hover:shadow-glow-blue" },
};

function trendColor(dir: string, category: string): string {
  if (category === "risk") {
    return dir === "up" ? "text-red-400" : dir === "down" ? "text-emerald-400" : "text-deevo-text-muted";
  }
  return dir === "up" ? "text-emerald-400" : dir === "down" ? "text-red-400" : "text-deevo-text-muted";
}

function trendBg(dir: string, category: string): string {
  if (category === "risk") {
    return dir === "up" ? "bg-red-500/8" : dir === "down" ? "bg-emerald-500/8" : "bg-deevo-elevated";
  }
  return dir === "up" ? "bg-emerald-500/8" : dir === "down" ? "bg-red-500/8" : "bg-deevo-elevated";
}

const ARROW: Record<string, string> = { up: "↑", down: "↓", stable: "→" };

export function KpiStrip({ kpis, loading }: KpiStripProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-5 gap-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-36 rounded-2xl shimmer" />
        ))}
      </div>
    );
  }

  if (!kpis || kpis.length === 0) return null;

  const sorted = [...kpis].sort(
    (a, b) => Math.abs(b.trend.change_pct) - Math.abs(a.trend.change_pct)
  );
  const top5 = sorted.slice(0, 5);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
      {top5.map((kpi, idx) => {
        const accent = CATEGORY_ACCENT[kpi.category] || CATEGORY_ACCENT.economic;
        const dir = kpi.trend.direction;
        const deltaPct = Math.abs(kpi.trend.change_pct);

        return (
          <div
            key={kpi.id}
            className={`exec-card rounded-2xl p-5 border-l-[3px] ${accent.border} ${accent.glow} fade-in-up`}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* Category */}
            <div className={`text-label mb-4 ${accent.label}`}>
              {kpi.category}
            </div>

            {/* Value — dominant */}
            <div className="mb-1">
              <span className="text-display text-deevo-text-primary">
                {kpi.value.toFixed(1)}
              </span>
              <span className="text-sm text-deevo-text-muted ml-1.5 font-normal">
                {kpi.unit}
              </span>
            </div>

            {/* KPI Name */}
            <div className="text-xs text-deevo-text-secondary mb-4 line-clamp-1 leading-tight">
              {kpi.name.en}
            </div>

            {/* Trend badge */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${trendBg(dir, kpi.category)}`}>
              <span className={`text-sm font-semibold ${trendColor(dir, kpi.category)}`}>
                {ARROW[dir]}
              </span>
              <span className={`text-sm font-mono font-semibold ${trendColor(dir, kpi.category)}`}>
                {deltaPct.toFixed(1)}%
              </span>
              {kpi.trend.previous_value > 0 && (
                <span className="text-[10px] text-deevo-text-muted ml-1">
                  from {kpi.trend.previous_value.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
