"use client";

/**
 * Executive Mode — Minimal, narrative-focused intelligence view.
 *
 * Designed for: Ministers, board members, C-suite executives.
 * Shows ONLY what matters: scenario summary, key numbers, narrative, decisions.
 * No charts, no clutter, no technical detail.
 */

import { useIntelligence } from "@/lib/context/IntelligenceContext";
import { StartIntelligence } from "@/components/activation/StartIntelligence";
import { ExportPanel } from "@/components/export/ExportPanel";

// ─── Helpers ──────────────────────────────────────────────────────

function severityColor(score: number): string {
  if (score >= 70) return "text-red-400";
  if (score >= 50) return "text-orange-400";
  if (score >= 30) return "text-yellow-400";
  return "text-emerald-400";
}

function riskLabel(score: number): string {
  if (score >= 70) return "CRITICAL";
  if (score >= 50) return "ELEVATED";
  if (score >= 30) return "MODERATE";
  return "LOW";
}

// ─── Page ────────────────────────────────────────────────────────

export default function ExecutiveMode() {
  const { snapshot, snapshotLoading, activeScenarioId } = useIntelligence();

  const narrative = snapshot?.narrative;
  const scores = snapshot?.scores;
  const risks = snapshot?.risk_register;
  const decisions = snapshot?.decisions || [];
  const countries = snapshot?.country_impacts || [];

  const topDecisions = [...decisions]
    .sort((a, b) => {
      const order: Record<string, number> = { immediate: 0, short_term: 1, medium_term: 2, long_term: 3 };
      return (order[a.recommendation.priority] ?? 4) - (order[b.recommendation.priority] ?? 4);
    })
    .slice(0, 3);

  // No data state
  if (!snapshotLoading && !snapshot) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full fade-in-up">
          <div className="text-center mb-8">
            <div className="text-label text-deevo-gold tracking-widest mb-3">
              EXECUTIVE MODE
            </div>
            <h1 className="text-xl font-semibold text-deevo-text-primary mb-2">
              No Active Intelligence
            </h1>
            <p className="text-[13px] text-deevo-text-secondary">
              Activate the intelligence pipeline to generate your executive brief.
            </p>
          </div>
          <StartIntelligence />
        </div>
      </div>
    );
  }

  // Loading state
  if (snapshotLoading) {
    return (
      <div className="max-w-3xl mx-auto p-10">
        <div className="space-y-6">
          <div className="h-8 shimmer rounded-lg w-1/3" />
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 shimmer rounded-xl" />)}
          </div>
          <div className="h-40 shimmer rounded-xl" />
          <div className="h-32 shimmer rounded-xl" />
        </div>
      </div>
    );
  }

  const aggregateRisk = risks?.aggregate_risk_score ?? 0;
  const confidence = (scores?.confidence ?? 0) * 100;
  const immediateCount = decisions.filter(d => d.recommendation.priority === "immediate").length;

  return (
    <div className="max-w-3xl mx-auto p-8 lg:p-12 fade-in-up">
      {/* ── Classification Bar ── */}
      <div className="mb-10">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-deevo-gold to-transparent mb-6" />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-label text-deevo-gold tracking-widest mb-1">
              EXECUTIVE INTELLIGENCE BRIEF
            </div>
            <div className="text-[11px] text-deevo-text-muted font-mono">
              {activeScenarioId ? activeScenarioId.slice(0, 24) : "—"}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-label ${aggregateRisk >= 50 ? "text-red-400" : "text-deevo-text-muted"} tracking-widest`}>
                RISK LEVEL: {riskLabel(aggregateRisk)}
              </div>
              <div className="text-[11px] text-deevo-text-muted mt-0.5">
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
            <ExportPanel />
          </div>
        </div>
      </div>

      {/* ── Key Metrics ── */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <MetricCard
          label="Overall Score"
          value={(scores?.overall_score ?? 0).toFixed(0)}
          color={severityColor(scores?.overall_score ?? 0)}
        />
        <MetricCard
          label="Aggregate Risk"
          value={aggregateRisk.toFixed(0)}
          color={severityColor(aggregateRisk)}
        />
        <MetricCard
          label="Immediate Decisions"
          value={String(immediateCount)}
          color={immediateCount > 2 ? "text-red-400" : immediateCount > 0 ? "text-yellow-400" : "text-emerald-400"}
        />
        <MetricCard
          label="Confidence"
          value={`${confidence.toFixed(0)}%`}
          color={confidence >= 70 ? "text-emerald-400" : "text-yellow-400"}
        />
      </div>

      {/* ── Narrative ── */}
      {narrative && (
        <div className="mb-10 space-y-6">
          {/* Title + Assessment body */}
          <div className="exec-card rounded-xl p-6">
            <div className="briefing-section">
              {narrative.title?.en && (
                <div className="section-header-gold mb-3">{narrative.title.en.toUpperCase()}</div>
              )}
              {narrative.body?.en && (
                <p className="text-[14px] text-deevo-text-primary leading-relaxed font-medium">
                  {narrative.body.en}
                </p>
              )}
            </div>
          </div>

          {/* Key Points */}
          {narrative.key_points && narrative.key_points.length > 0 && (
            <div className="exec-card rounded-xl p-6">
              <div className="section-header-gold mb-4">KEY FINDINGS</div>
              <div className="space-y-3">
                {narrative.key_points.map((point: { en: string; ar: string }, i: number) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-1.5 h-1.5 bg-deevo-gold rounded-full mt-2 shrink-0" />
                    <p className="text-[13px] text-deevo-text-secondary leading-relaxed">{point.en}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Top Decisions ── */}
      {topDecisions.length > 0 && (
        <div className="mb-10">
          <div className="section-header-gold mb-4">PRIORITY DECISIONS</div>
          <div className="space-y-3">
            {topDecisions.map((d, i) => {
              const priorityColor =
                d.recommendation.priority === "immediate" ? "border-l-red-400" :
                d.recommendation.priority === "short_term" ? "border-l-orange-400" :
                "border-l-yellow-400";
              return (
                <div key={i} className={`exec-card rounded-xl p-5 border-l-2 ${priorityColor}`}>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-[13px] font-semibold text-deevo-text-primary">
                      {d.recommendation.title.en}
                    </h3>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded shrink-0 ${
                      d.recommendation.priority === "immediate"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}>
                      {d.recommendation.priority.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[12px] text-deevo-text-secondary leading-relaxed">
                    {d.recommendation.action.en}
                  </p>
                  {d.explanation.why_it_matters?.en && (
                    <p className="text-[11px] text-deevo-text-muted leading-relaxed mt-2">
                      {d.explanation.why_it_matters.en}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Country Impact Strip ── */}
      {countries.length > 0 && (
        <div className="mb-8">
          <div className="section-header-gold mb-4">COUNTRY IMPACT</div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {countries.map((c) => (
              <div key={c.country_code} className="exec-card rounded-lg p-3 text-center">
                <div className="text-[12px] font-medium text-deevo-text-primary mb-1">
                  {c.country_code}
                </div>
                <div className={`text-metric ${severityColor(c.macro_sensitivity)}`}>
                  {c.macro_sensitivity.toFixed(0)}
                </div>
                <div className="text-[9px] text-deevo-text-muted mt-0.5">{c.risk_level}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Classification Footer ── */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-deevo-gold/30 to-transparent mt-10" />
      <div className="mt-4 text-center text-[10px] text-deevo-text-muted">
        Generated by Deevo Executive Intelligence · 12-Stage Deterministic Pipeline · Zero Hallucination · PDPL Compliant
      </div>
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="exec-card rounded-xl p-4 text-center">
      <div className="text-[10px] text-deevo-text-muted mb-2 tracking-wide uppercase">{label}</div>
      <div className={`text-headline ${color} tabular-nums`}>{value}</div>
    </div>
  );
}
