"use client";

/**
 * Decision Drilldown — Prioritized Executive Action Queue
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │  Header — counts by urgency + total pressure                 │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Urgency Filter Strip — all / immediate / short / medium     │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Decision Cards (full drilldown):                            │
 *   │    • Pressure bar + score                                    │
 *   │    • Priority badge                                          │
 *   │    • Title + Action CTA                                      │
 *   │    • Full reasoning chain: What → Why → Who → Rationale      │
 *   │    • GDP components moved                                    │
 *   │    • Sectors under pressure                                  │
 *   │    • Likely next developments                                │
 *   │    • Affected entities + confidence                          │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * Data: snapshot.decisions from useIntelligence()
 */

import { useState, useMemo } from "react";
import { useIntelligence } from "@/lib/context/IntelligenceContext";
import type { ExplainedDecision, DecisionUrgency } from "@/types/decision";

// ─── Styles ──────────────────────────────────────────────────────

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

function pressureBarGradient(score: number): string {
  if (score >= 70) return "bg-gradient-to-r from-red-600 to-red-400";
  if (score >= 50) return "bg-gradient-to-r from-orange-600 to-orange-400";
  if (score >= 30) return "bg-gradient-to-r from-yellow-600 to-yellow-400";
  return "bg-gradient-to-r from-emerald-600 to-emerald-400";
}

type FilterKey = "all" | DecisionUrgency;

// ─── Page ────────────────────────────────────────────────────────

export default function DecisionDrilldownPage() {
  const {
    snapshot,
    snapshotLoading,
    scenariosLoading,
    activeScenarioId,
    triggerIngestion,
    ingestionRunning,
  } = useIntelligence();

  const loading = scenariosLoading || snapshotLoading;
  const decisions = snapshot?.decisions || [];
  const [filter, setFilter] = useState<FilterKey>("all");

  // Sort by pressure then urgency
  const sorted = useMemo(() => {
    return [...decisions].sort((a, b) => {
      const dp = b.recommendation.pressure.score - a.recommendation.pressure.score;
      if (dp !== 0) return dp;
      return (URGENCY_RANK[a.recommendation.priority] ?? 3) - (URGENCY_RANK[b.recommendation.priority] ?? 3);
    });
  }, [decisions]);

  const filtered = useMemo(() => {
    if (filter === "all") return sorted;
    return sorted.filter((d) => d.recommendation.priority === filter);
  }, [sorted, filter]);

  // Counts
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: decisions.length };
    for (const d of decisions) {
      c[d.recommendation.priority] = (c[d.recommendation.priority] || 0) + 1;
    }
    return c;
  }, [decisions]);

  const avgPressure = useMemo(() => {
    if (decisions.length === 0) return 0;
    return decisions.reduce((s, d) => s + d.recommendation.pressure.score, 0) / decisions.length;
  }, [decisions]);

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "immediate", label: "Immediate" },
    { key: "short_term", label: "Short Term" },
    { key: "medium_term", label: "Medium Term" },
    { key: "long_term", label: "Long Term" },
  ];

  return (
    <div className="p-8 lg:p-10 max-w-[1200px] mx-auto">

      {/* ════════════════════════════════════════════════════════
          PAGE HEADER
          ════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-deevo-text-primary">
            Decision Intelligence
          </h1>
          <p className="text-caption mt-0.5">
            Prioritized Recommendations · Full Reasoning Chains · Confidence-Scored
          </p>
        </div>
        {activeScenarioId && (
          <span className="text-[10px] text-deevo-text-muted font-mono bg-deevo-elevated px-3 py-1.5 rounded-lg">
            {activeScenarioId.slice(0, 20)}
          </span>
        )}
      </div>

      {/* Summary bar */}
      {!loading && decisions.length > 0 && (
        <div className="score-banner rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-8 flex-wrap">
            <div>
              <div className="text-label text-deevo-text-muted mb-1">Total</div>
              <div className="text-headline text-deevo-text-primary">{decisions.length}</div>
            </div>
            <div>
              <div className="text-label text-deevo-text-muted mb-1">Avg Pressure</div>
              <div className={`text-headline tabular-nums ${pressureColor(avgPressure)}`}>
                {avgPressure.toFixed(1)}
              </div>
            </div>
            {["immediate", "short_term", "medium_term", "long_term"].map((u) => {
              const s = URGENCY_STYLE[u];
              const c = counts[u] || 0;
              if (c === 0) return null;
              return (
                <div key={u}>
                  <div className="text-label text-deevo-text-muted mb-1">{s.label}</div>
                  <div className={`text-headline tabular-nums ${s.color}`}>{c}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          FILTER STRIP
          ════════════════════════════════════════════════════════ */}
      {!loading && decisions.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          {FILTERS.map((f) => {
            const isActive = filter === f.key;
            const count = counts[f.key] || 0;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-[11px] px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-deevo-elevated text-deevo-text-primary border border-deevo-border"
                    : "text-deevo-text-muted hover:text-deevo-text-secondary border border-transparent"
                }`}
              >
                {f.label} <span className="font-mono ml-1 opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          DECISION LIST
          ════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-60 shimmer rounded-2xl" />
          ))}
        </div>
      ) : decisions.length === 0 ? (
        <div className="exec-card rounded-2xl p-12 text-center">
          <div className="text-sm text-deevo-text-muted mb-2">No decisions generated</div>
          <p className="text-caption mb-4">
            Decisions generate when the pipeline detects actionable intelligence.
          </p>
          <button
            onClick={triggerIngestion}
            disabled={ingestionRunning}
            className="px-5 py-2 text-sm font-medium bg-deevo-accent text-white rounded-xl hover:bg-blue-600 disabled:opacity-40 transition-colors"
          >
            {ingestionRunning ? "Ingesting..." : "Run Intelligence Pipeline"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((decision, idx) => (
            <DecisionDrilldown key={decision.recommendation.id || idx} decision={decision} idx={idx} />
          ))}
          {filtered.length === 0 && (
            <div className="exec-card rounded-2xl p-8 text-center">
              <div className="text-sm text-deevo-text-muted">No decisions match the selected filter.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Decision Drilldown Card ─────────────────────────────────────

function DecisionDrilldown({ decision, idx }: { decision: ExplainedDecision; idx: number }) {
  const rec = decision.recommendation;
  const exp = decision.explanation;
  const style = URGENCY_STYLE[rec.priority] || URGENCY_STYLE.medium_term;
  const pressure = rec.pressure.score;

  return (
    <div
      className={`exec-card rounded-2xl overflow-hidden border ${style.border} fade-in-up`}
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      {/* Pressure bar */}
      <div className="pressure-bar">
        <div
          className={`pressure-bar-fill ${pressureBarGradient(pressure)}`}
          style={{ width: `${Math.min(pressure, 100)}%` }}
        />
      </div>

      <div className="p-6">
        {/* Header — urgency + pressure */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`text-label px-2.5 py-1 rounded-md ${style.bg} ${style.color}`}>
              {style.label}
            </span>
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

        {/* Action CTA */}
        <div className="px-4 py-2.5 rounded-xl bg-deevo-accent/8 border border-deevo-accent/20 mb-5">
          <span className="text-sm text-deevo-accent font-medium">{rec.action.en}</span>
        </div>

        {/* Full Reasoning Chain */}
        <div className="space-y-4 mb-5">
          {exp.what_happened?.en && (
            <ReasoningSection label="What Happened" text={exp.what_happened.en} />
          )}
          {exp.why_it_matters?.en && (
            <ReasoningSection label="Why It Matters" text={exp.why_it_matters.en} />
          )}
          {exp.who_is_affected.length > 0 && (
            <div className="briefing-section">
              <div className="text-label text-deevo-text-muted mb-1.5">Who Is Affected</div>
              <div className="flex flex-wrap gap-1.5">
                {exp.who_is_affected.map((entity, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 bg-deevo-elevated text-deevo-text-secondary rounded-md">
                    {entity}
                  </span>
                ))}
              </div>
            </div>
          )}
          {exp.why_this_recommendation?.en && (
            <ReasoningSection label="Rationale" text={exp.why_this_recommendation.en} />
          )}
        </div>

        {/* GDP Components + Sectors Under Pressure */}
        {(exp.gdp_components_moved.length > 0 || exp.sectors_under_pressure.length > 0) && (
          <div className="flex flex-wrap gap-4 mb-5">
            {exp.gdp_components_moved.length > 0 && (
              <div>
                <div className="text-label text-deevo-text-muted mb-1">GDP Components Moved</div>
                <div className="flex flex-wrap gap-1">
                  {exp.gdp_components_moved.map((c) => (
                    <span key={c} className="text-[10px] px-1.5 py-0.5 bg-orange-500/8 text-orange-400 rounded">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {exp.sectors_under_pressure.length > 0 && (
              <div>
                <div className="text-label text-deevo-text-muted mb-1">Sectors Under Pressure</div>
                <div className="flex flex-wrap gap-1">
                  {exp.sectors_under_pressure.map((s) => (
                    <span key={s} className="text-[10px] px-1.5 py-0.5 bg-red-500/8 text-red-400 rounded">
                      {s.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Likely Next Developments */}
        {exp.likely_next_developments && exp.likely_next_developments.length > 0 && (
          <div className="briefing-section mb-5">
            <div className="section-header-gold mb-2">Likely Next Developments</div>
            <div className="space-y-1.5">
              {exp.likely_next_developments.map((dev, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-deevo-gold mt-1.5" />
                  <span className="text-[12px] text-deevo-text-secondary leading-relaxed">
                    {dev.en}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer — entities + pressure drivers + confidence */}
        <div className="pt-4 border-t border-deevo-border-subtle">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Affected entities */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {rec.affected_entities.slice(0, 8).map((e) => (
                  <span key={e} className="text-[10px] px-2 py-0.5 bg-deevo-elevated text-deevo-text-muted rounded-md">
                    {e}
                  </span>
                ))}
                {rec.affected_entities.length > 8 && (
                  <span className="text-[10px] text-deevo-text-muted">+{rec.affected_entities.length - 8}</span>
                )}
              </div>
              {/* Pressure drivers */}
              {rec.pressure.primary_drivers.length > 0 && (
                <div className="text-[10px] text-deevo-text-muted">
                  Drivers: {rec.pressure.primary_drivers.join(" · ")}
                </div>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[10px] text-deevo-text-muted font-mono">
                {(rec.confidence * 100).toFixed(0)}% confidence
              </div>
              <div className="text-[10px] text-deevo-text-muted font-mono">
                {(exp.confidence * 100).toFixed(0)}% explanation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reasoning Section ───────────────────────────────────────────

function ReasoningSection({ label, text }: { label: string; text: string }) {
  return (
    <div className="briefing-section">
      <div className="text-label text-deevo-text-muted mb-1">{label}</div>
      <div className="text-[13px] text-deevo-text-secondary leading-relaxed">{text}</div>
    </div>
  );
}
