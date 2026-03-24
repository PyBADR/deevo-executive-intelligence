"use client";

/**
 * ScenarioFeed — Live intelligence scenarios.
 *
 * Visual Design:
 *   - Severity color bar at top of each card
 *   - Compact but readable scenario summaries
 *   - Pipeline metrics when available
 *   - Breathing room between items
 */

import type { LiveScenario } from "@/lib/api/client";

interface ScenarioFeedProps {
  scenarios: LiveScenario[];
  loading?: boolean;
  onTriggerIngestion?: () => void;
  ingestionRunning?: boolean;
}

const SEV_BAR: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500/80",
  low: "bg-emerald-500/80",
};

const SEV_TEXT: Record<string, string> = {
  critical: "text-red-400",
  high: "text-orange-400",
  medium: "text-yellow-400",
  low: "text-emerald-400",
};

const SEV_BG: Record<string, string> = {
  critical: "bg-red-500/10",
  high: "bg-orange-500/10",
  medium: "bg-yellow-500/8",
  low: "bg-emerald-500/8",
};

function scoreColor(v: number): string {
  return v >= 60 ? "text-red-400" : v >= 40 ? "text-yellow-400" : "text-emerald-400";
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function ScenarioFeed({ scenarios, loading, onTriggerIngestion, ingestionRunning }: ScenarioFeedProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 shimmer rounded" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-36 rounded-2xl shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-deevo-text-primary tracking-tight">
            Intelligence Feed
          </h2>
          <span className="text-caption">
            {scenarios.length} active scenario{scenarios.length !== 1 ? "s" : ""}
          </span>
        </div>
        {onTriggerIngestion && (
          <button
            onClick={onTriggerIngestion}
            disabled={ingestionRunning}
            className="px-3.5 py-1.5 text-xs font-medium bg-deevo-elevated text-deevo-text-secondary rounded-lg border border-deevo-border hover:border-deevo-accent hover:text-deevo-accent disabled:opacity-40 transition-all"
          >
            {ingestionRunning ? "Ingesting..." : "Refresh Intel"}
          </button>
        )}
      </div>

      {/* Empty */}
      {scenarios.length === 0 && (
        <div className="exec-card rounded-2xl p-10 text-center">
          <div className="text-sm text-deevo-text-muted mb-1">No live intelligence</div>
          <div className="text-caption">
            Run ingestion to fetch and classify events from RSS feeds.
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {scenarios.map((s, idx) => (
          <div
            key={s.scenario_id}
            className="exec-card rounded-2xl overflow-hidden fade-in-up"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            {/* Severity bar */}
            <div className={`h-[3px] ${SEV_BAR[s.severity] || SEV_BAR.medium}`} />

            <div className="p-4">
              {/* Meta row */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`text-label ${SEV_TEXT[s.severity]}`}>
                    {s.severity}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${SEV_BG[s.severity]} ${SEV_TEXT[s.severity]}`}>
                    {s.scenario_type}
                  </span>
                </div>
                <span className="text-[10px] text-deevo-text-muted font-mono">
                  {s.created_at ? relativeTime(s.created_at) : ""}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-[13px] font-medium text-deevo-text-primary mb-3 leading-snug">
                {s.title.en}
              </h3>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {s.affected_countries.map((c) => (
                  <span key={c} className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded font-medium">
                    {c}
                  </span>
                ))}
                {s.linked_sectors.slice(0, 2).map((sec) => (
                  <span key={sec} className="text-[10px] px-1.5 py-0.5 bg-deevo-elevated text-deevo-text-muted rounded">
                    {sec.replace(/_/g, " ")}
                  </span>
                ))}
                {s.linked_sectors.length > 2 && (
                  <span className="text-[10px] text-deevo-text-muted">
                    +{s.linked_sectors.length - 2}
                  </span>
                )}
              </div>

              {/* Pipeline metrics */}
              {s.pipeline && (
                <div className="flex items-center gap-5 text-[11px] pt-3 border-t border-deevo-border-subtle">
                  <Metric label="Score" value={s.pipeline.overall_score} />
                  <Metric label="Risk" value={s.pipeline.aggregate_risk_score} />
                  <Metric label="Stress" value={s.pipeline.macro_stress} />
                  <span className="text-deevo-text-muted ml-auto font-mono text-[10px]">
                    {s.source_count} src · {(s.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <span>
      <span className="text-deevo-text-muted">{label} </span>
      <span className={`font-mono font-semibold ${scoreColor(value)}`}>
        {value.toFixed(1)}
      </span>
    </span>
  );
}
