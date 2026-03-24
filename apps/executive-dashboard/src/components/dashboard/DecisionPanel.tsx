"use client";

/**
 * DecisionPanel — Prioritized decision queue with hero first decision.
 *
 * Visual Design:
 *   - First decision renders as HERO card (larger, more prominent)
 *   - Remaining decisions render as compact cards
 *   - Pressure bar with color gradient
 *   - Full reasoning chain: what → why → rationale
 *   - Clear call-to-action styling on the action text
 *
 * Data: snapshot.decisions (ExplainedDecision[])
 */

import type { ExplainedDecision } from "@/types/decision";

interface DecisionPanelProps {
  decisions: ExplainedDecision[];
  loading?: boolean;
}

const URGENCY_RANK: Record<string, number> = {
  immediate: 0, short_term: 1, medium_term: 2, long_term: 3,
};

const URGENCY_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  immediate:   { label: "IMMEDIATE",   color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/30" },
  short_term:  { label: "SHORT TERM",  color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  medium_term: { label: "MEDIUM TERM", color: "text-yellow-400", bg: "bg-yellow-500/8",  border: "border-yellow-500/15" },
  long_term:   { label: "LONG TERM",   color: "text-blue-400",   bg: "bg-blue-500/8",    border: "border-blue-500/15" },
};

function pressureColor(score: number): string {
  if (score >= 70) return "text-red-400";
  if (score >= 50) return "text-orange-400";
  if (score >= 30) return "text-yellow-400";
  return "text-emerald-400";
}

function pressureBarColor(score: number): string {
  if (score >= 70) return "bg-gradient-to-r from-red-600 to-red-400";
  if (score >= 50) return "bg-gradient-to-r from-orange-600 to-orange-400";
  if (score >= 30) return "bg-gradient-to-r from-yellow-600 to-yellow-400";
  return "bg-gradient-to-r from-emerald-600 to-emerald-400";
}

export function DecisionPanel({ decisions, loading }: DecisionPanelProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 shimmer rounded" />
        <div className="h-56 rounded-2xl shimmer" />
        <div className="h-36 rounded-2xl shimmer" />
        <div className="h-36 rounded-2xl shimmer" />
      </div>
    );
  }

  const sorted = [...decisions].sort((a, b) => {
    const dp = b.recommendation.pressure.score - a.recommendation.pressure.score;
    if (dp !== 0) return dp;
    return (URGENCY_RANK[a.recommendation.priority] ?? 3) - (URGENCY_RANK[b.recommendation.priority] ?? 3);
  });

  const hero = sorted[0] ?? null;
  const rest = sorted.slice(1);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-deevo-text-primary tracking-tight">
            Decision Queue
          </h2>
          <span className="text-caption">
            {decisions.length} recommendation{decisions.length !== 1 ? "s" : ""} ·{" "}
            <span className="text-red-400">
              {decisions.filter((d) => d.recommendation.priority === "immediate").length} immediate
            </span>
          </span>
        </div>
      </div>

      {/* Empty */}
      {decisions.length === 0 && (
        <div className="exec-card rounded-2xl p-10 text-center">
          <div className="text-sm text-deevo-text-muted mb-1">No decisions</div>
          <div className="text-caption">
            Decisions generate when the pipeline detects actionable intelligence.
          </div>
        </div>
      )}

      {/* Hero Decision */}
      {hero && <HeroDecision decision={hero} />}

      {/* Remaining Decisions */}
      <div className="space-y-3 mt-3">
        {rest.map((d, idx) => (
          <CompactDecision key={d.recommendation.id || idx} decision={d} idx={idx} />
        ))}
      </div>
    </div>
  );
}

// ─── Hero Decision ──────────────────────────────────────────────

function HeroDecision({ decision }: { decision: ExplainedDecision }) {
  const rec = decision.recommendation;
  const exp = decision.explanation;
  const style = URGENCY_STYLE[rec.priority] || URGENCY_STYLE.medium_term;
  const pressure = rec.pressure.score;

  return (
    <div className={`exec-card-glow rounded-2xl overflow-hidden border ${style.border} fade-in-up`}>
      {/* Pressure bar — full width */}
      <div className="pressure-bar">
        <div
          className={`pressure-bar-fill ${pressureBarColor(pressure)}`}
          style={{ width: `${Math.min(pressure, 100)}%` }}
        />
      </div>

      <div className="p-6">
        {/* Urgency + Pressure */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`text-label px-2.5 py-1 rounded-md ${style.bg} ${style.color}`}>
              {style.label}
            </span>
            <span className="text-label text-deevo-text-muted">TOP PRIORITY</span>
          </div>
          <div className="text-right">
            <div className={`text-headline tabular-nums ${pressureColor(pressure)}`}>
              {pressure.toFixed(0)}
            </div>
            <div className="text-label text-deevo-text-muted mt-0.5">Pressure</div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-deevo-text-primary mb-2 leading-snug">
          {rec.title.en}
        </h3>

        {/* Action — call to action */}
        <div className="px-4 py-2.5 rounded-xl bg-deevo-accent/8 border border-deevo-accent/20 mb-5">
          <span className="text-sm text-deevo-accent font-medium">{rec.action.en}</span>
        </div>

        {/* Reasoning chain */}
        <div className="space-y-3">
          {exp.what_happened?.en && (
            <ReasoningRow label="What happened" text={exp.what_happened.en} />
          )}
          {exp.why_it_matters?.en && (
            <ReasoningRow label="Why it matters" text={exp.why_it_matters.en} />
          )}
          {exp.why_this_recommendation?.en && (
            <ReasoningRow label="Rationale" text={exp.why_this_recommendation.en} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-deevo-border-subtle">
          <div className="flex flex-wrap gap-1.5">
            {rec.affected_entities.slice(0, 5).map((e) => (
              <span key={e} className="text-[10px] px-2 py-0.5 bg-deevo-elevated text-deevo-text-muted rounded-md">
                {e}
              </span>
            ))}
            {rec.affected_entities.length > 5 && (
              <span className="text-[10px] text-deevo-text-muted">+{rec.affected_entities.length - 5}</span>
            )}
          </div>
          <span className="text-[10px] text-deevo-text-muted font-mono">
            {(rec.confidence * 100).toFixed(0)}% confidence
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Compact Decision ───────────────────────────────────────────

function CompactDecision({ decision, idx }: { decision: ExplainedDecision; idx: number }) {
  const rec = decision.recommendation;
  const exp = decision.explanation;
  const style = URGENCY_STYLE[rec.priority] || URGENCY_STYLE.medium_term;
  const pressure = rec.pressure.score;

  return (
    <div
      className="exec-card rounded-2xl overflow-hidden fade-in-up"
      style={{ animationDelay: `${(idx + 1) * 50}ms` }}
    >
      {/* Thin pressure bar */}
      <div className="pressure-bar">
        <div
          className={`pressure-bar-fill ${pressureBarColor(pressure)}`}
          style={{ width: `${Math.min(pressure, 100)}%` }}
        />
      </div>

      <div className="p-4">
        {/* Urgency + Pressure */}
        <div className="flex items-center justify-between mb-2.5">
          <span className={`text-label px-2 py-0.5 rounded ${style.bg} ${style.color}`}>
            {style.label}
          </span>
          <span className={`text-sm font-mono font-semibold tabular-nums ${pressureColor(pressure)}`}>
            {pressure.toFixed(0)}
          </span>
        </div>

        {/* Title + Action */}
        <h3 className="text-[13px] font-medium text-deevo-text-primary mb-1 leading-snug">
          {rec.title.en}
        </h3>
        <p className="text-xs text-deevo-accent mb-3">{rec.action.en}</p>

        {/* Key reasoning (condensed) */}
        {exp.why_it_matters?.en && (
          <p className="text-[11px] text-deevo-text-secondary leading-relaxed mb-3">
            {exp.why_it_matters.en}
          </p>
        )}

        {/* Tags + confidence */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {rec.affected_entities.slice(0, 3).map((e) => (
              <span key={e} className="text-[10px] px-1.5 py-0.5 bg-deevo-elevated text-deevo-text-muted rounded">
                {e}
              </span>
            ))}
          </div>
          <span className="text-[10px] text-deevo-text-muted font-mono">
            {(rec.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Reasoning Row ──────────────────────────────────────────────

function ReasoningRow({ label, text }: { label: string; text: string }) {
  return (
    <div className="briefing-section">
      <div className="text-label text-deevo-text-muted mb-1">{label}</div>
      <div className="text-xs text-deevo-text-secondary leading-relaxed">{text}</div>
    </div>
  );
}
