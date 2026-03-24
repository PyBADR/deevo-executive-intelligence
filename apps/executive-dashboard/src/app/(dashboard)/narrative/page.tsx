"use client";

/**
 * Executive Intelligence Brief — Sovereign-Grade Narrative
 *
 * This is the page you print and hand to a Minister.
 * No technical jargon. No code language. Pure intelligence storytelling.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │  Document Header — classification bar + title + timestamp    │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Assessment Summary — score / risk / decisions / confidence  │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  § What Is Happening — narrative title + body                │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  § Key Findings — gold-bulleted key points                   │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  § Economic Impact — country cards with sensitivity + risk   │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  § KPI Headline — top executive KPIs                         │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  § Risk Assessment — register explanation + severity dist    │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  § Recommended Actions — top decisions with reasoning        │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Document Footer — pipeline provenance + disclaimer          │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * Data: Full snapshot from useIntelligence()
 */

import { useIntelligence } from "@/lib/context/IntelligenceContext";

// ─── Helpers ─────────────────────────────────────────────────────

function scoreColor(v: number): string {
  return v >= 60 ? "text-red-400" : v >= 40 ? "text-yellow-400" : "text-emerald-400";
}

const COUNTRY_NAMES: Record<string, string> = {
  SA: "Saudi Arabia", AE: "United Arab Emirates", KW: "Kuwait",
  QA: "Qatar", BH: "Bahrain", OM: "Oman",
};

const RISK_LABEL: Record<string, { text: string; color: string }> = {
  critical: { text: "Critical", color: "text-red-400" },
  high:     { text: "High",     color: "text-orange-400" },
  elevated: { text: "Elevated", color: "text-yellow-400" },
  moderate: { text: "Moderate", color: "text-blue-400" },
  stable:   { text: "Stable",   color: "text-emerald-400" },
};

// ─── Page ────────────────────────────────────────────────────────

export default function ExecutiveNarrativePage() {
  const {
    snapshot,
    snapshotLoading,
    scenariosLoading,
    activeScenarioId,
    triggerIngestion,
    ingestionRunning,
  } = useIntelligence();

  const loading = scenariosLoading || snapshotLoading;

  if (loading) {
    return (
      <div className="p-8 lg:p-10 max-w-[960px] mx-auto">
        <div className="h-12 w-64 shimmer rounded mb-6" />
        <div className="h-8 w-96 shimmer rounded mb-10" />
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 shimmer rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="p-8 lg:p-10 max-w-[960px] mx-auto">
        <div className="exec-card rounded-2xl p-12 text-center">
          <div className="text-sm text-deevo-text-muted mb-2">No intelligence available</div>
          <p className="text-caption mb-4">
            The executive brief generates once the intelligence pipeline has processed a scenario.
          </p>
          <button
            onClick={triggerIngestion}
            disabled={ingestionRunning}
            className="px-5 py-2 text-sm font-medium bg-deevo-accent text-white rounded-xl hover:bg-blue-600 disabled:opacity-40 transition-colors"
          >
            {ingestionRunning ? "Ingesting..." : "Run Intelligence Pipeline"}
          </button>
        </div>
      </div>
    );
  }

  const narrative = snapshot.narrative;
  const scores = snapshot.scores;
  const riskRegister = snapshot.risk_register;
  const kpis = snapshot.kpi_dashboard?.executive_kpis || [];
  const kpiHeadline = snapshot.kpi_dashboard?.headline?.en;
  const decisions = snapshot.decisions || [];
  const countries = snapshot.country_impacts || [];
  const immediateDecisions = decisions.filter((d) => d.recommendation.priority === "immediate");

  return (
    <div className="p-8 lg:p-10 max-w-[960px] mx-auto">

      {/* ════════════════════════════════════════════════════════
          DOCUMENT HEADER
          ════════════════════════════════════════════════════════ */}
      <div className="exec-card rounded-2xl overflow-hidden mb-8 fade-in-up">
        {/* Classification bar */}
        <div className="h-1 bg-gradient-to-r from-deevo-gold via-deevo-gold/60 to-transparent" />

        <div className="p-8">
          <div className="text-label text-deevo-gold tracking-widest mb-4">
            EXECUTIVE INTELLIGENCE BRIEF
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-deevo-text-primary leading-tight mb-3">
            {narrative?.title?.en || "Intelligence Assessment"}
          </h1>
          <div className="flex items-center gap-4 text-[11px] text-deevo-text-muted">
            <span>Generated {new Date(snapshot.timestamp).toLocaleString()}</span>
            <span className="w-1 h-1 rounded-full bg-deevo-text-muted" />
            <span className="font-mono">{activeScenarioId?.slice(0, 24)}</span>
            <span className="w-1 h-1 rounded-full bg-deevo-text-muted" />
            <span>Deevo Analytics · Sovereign-Grade</span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          ASSESSMENT SUMMARY
          ════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 fade-in-up" style={{ animationDelay: "50ms" }}>
        <SummaryCard
          label="Composite Score"
          value={scores?.overall_score?.toFixed(1) || "—"}
          color={scores ? scoreColor(scores.overall_score) : "text-deevo-text-muted"}
          note="Weighted across all 12 pipeline stages"
        />
        <SummaryCard
          label="Aggregate Risk"
          value={riskRegister?.aggregate_risk_score?.toFixed(1) || "—"}
          color={riskRegister ? scoreColor(riskRegister.aggregate_risk_score) : "text-deevo-text-muted"}
          note={`${riskRegister?.critical_count ?? 0} critical · ${riskRegister?.high_count ?? 0} high`}
        />
        <SummaryCard
          label="Active Decisions"
          value={String(decisions.length)}
          color="text-deevo-text-primary"
          note={`${immediateDecisions.length} require immediate action`}
        />
        <SummaryCard
          label="Confidence"
          value={scores?.confidence ? `${(scores.confidence * 100).toFixed(0)}%` : "—"}
          color="text-deevo-text-secondary"
          note="Deterministic pipeline reliability"
        />
      </div>

      {/* ════════════════════════════════════════════════════════
          § WHAT IS HAPPENING
          ════════════════════════════════════════════════════════ */}
      {narrative?.body?.en && (
        <BriefSection label="What Is Happening" delay={100}>
          <p className="text-[15px] text-deevo-text-secondary leading-relaxed">
            {narrative.body.en}
          </p>
        </BriefSection>
      )}

      {/* ════════════════════════════════════════════════════════
          § KEY FINDINGS
          ════════════════════════════════════════════════════════ */}
      {narrative?.key_points && narrative.key_points.length > 0 && (
        <BriefSection label="Key Findings" delay={150}>
          <div className="space-y-3">
            {narrative.key_points.map((kp, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-deevo-gold mt-2" />
                <p className="text-[14px] text-deevo-text-secondary leading-relaxed">{kp.en}</p>
              </div>
            ))}
          </div>
        </BriefSection>
      )}

      {/* ════════════════════════════════════════════════════════
          § ECONOMIC IMPACT
          ════════════════════════════════════════════════════════ */}
      {countries.length > 0 && (
        <BriefSection label="Economic Impact Across the GCC" delay={200}>
          <p className="text-[13px] text-deevo-text-muted mb-5">
            Analysis identifies economic transmission across {countries.length} GCC economies,
            with effects propagating through trade, energy, fiscal, and financial channels.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[...countries]
              .sort((a, b) => b.macro_sensitivity - a.macro_sensitivity)
              .map((c) => {
                const rl = RISK_LABEL[c.risk_level] || RISK_LABEL.stable;
                const gdpPct = c.gdp_impact?.aggregate_impact ?? 0;
                return (
                  <div key={c.country_code} className="exec-card rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-deevo-gold font-medium">
                        {COUNTRY_NAMES[c.country_code] || c.country_code}
                      </span>
                      <span className={`text-label ${rl.color}`}>{rl.text}</span>
                    </div>
                    <div className={`text-headline tabular-nums ${scoreColor(c.macro_sensitivity)}`}>
                      {c.macro_sensitivity.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-deevo-text-muted mt-0.5">macro sensitivity</div>
                    {gdpPct !== 0 && (
                      <div className={`text-[11px] mt-1.5 font-mono ${
                        gdpPct < 0 ? "text-red-400" : "text-emerald-400"
                      }`}>
                        GDP {gdpPct > 0 ? "+" : ""}{(gdpPct * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </BriefSection>
      )}

      {/* ════════════════════════════════════════════════════════
          § KEY INDICATORS
          ════════════════════════════════════════════════════════ */}
      {(kpiHeadline || kpis.length > 0) && (
        <BriefSection label="Key Economic Indicators" delay={250}>
          {kpiHeadline && (
            <p className="text-[14px] text-deevo-text-secondary leading-relaxed mb-4">{kpiHeadline}</p>
          )}
          {kpis.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {kpis.slice(0, 6).map((kpi) => {
                const trendColor = kpi.trend.direction === "up"
                  ? (kpi.category === "risk" ? "text-red-400" : "text-emerald-400")
                  : kpi.trend.direction === "down"
                  ? (kpi.category === "risk" ? "text-emerald-400" : "text-red-400")
                  : "text-deevo-text-muted";
                return (
                  <div key={kpi.id} className="exec-card rounded-xl p-3.5">
                    <div className="text-[11px] text-deevo-text-muted mb-1">{kpi.name.en}</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[15px] font-semibold tabular-nums text-deevo-text-primary">
                        {kpi.value.toFixed(1)}{kpi.unit}
                      </span>
                      <span className={`text-[11px] font-mono ${trendColor}`}>
                        {kpi.trend.direction === "up" ? "↑" : kpi.trend.direction === "down" ? "↓" : "→"}
                        {Math.abs(kpi.trend.change_pct).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </BriefSection>
      )}

      {/* ════════════════════════════════════════════════════════
          § RISK ASSESSMENT
          ════════════════════════════════════════════════════════ */}
      {riskRegister && (
        <BriefSection label="Risk Assessment" delay={300}>
          {riskRegister.explanation?.en && (
            <p className="text-[14px] text-deevo-text-secondary leading-relaxed mb-4">
              {riskRegister.explanation.en}
            </p>
          )}
          <div className="flex items-center gap-4 text-[11px]">
            {riskRegister.critical_count > 0 && (
              <span className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 font-medium">
                {riskRegister.critical_count} Critical
              </span>
            )}
            {riskRegister.high_count > 0 && (
              <span className="px-2.5 py-1 rounded bg-orange-500/10 text-orange-400 font-medium">
                {riskRegister.high_count} High
              </span>
            )}
            {riskRegister.risks.filter((r) => r.severity === "medium").length > 0 && (
              <span className="px-2.5 py-1 rounded bg-yellow-500/8 text-yellow-400">
                {riskRegister.risks.filter((r) => r.severity === "medium").length} Medium
              </span>
            )}
            {riskRegister.risks.filter((r) => r.severity === "low").length > 0 && (
              <span className="px-2.5 py-1 rounded bg-emerald-500/8 text-emerald-400">
                {riskRegister.risks.filter((r) => r.severity === "low").length} Low
              </span>
            )}
          </div>
        </BriefSection>
      )}

      {/* ════════════════════════════════════════════════════════
          § RECOMMENDED ACTIONS
          ════════════════════════════════════════════════════════ */}
      {decisions.length > 0 && (
        <BriefSection label="Recommended Actions" delay={350}>
          <div className="space-y-4">
            {decisions
              .sort((a, b) => b.recommendation.pressure.score - a.recommendation.pressure.score)
              .slice(0, 5)
              .map((d, i) => {
                const priority = d.recommendation.priority;
                const isImmediate = priority === "immediate";
                return (
                  <div key={d.recommendation.id || i} className={`exec-card rounded-xl p-5 ${isImmediate ? "border border-red-500/20" : ""}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold ${
                        isImmediate ? "bg-red-500/10 text-red-400" : "bg-deevo-elevated text-deevo-text-muted"
                      }`}>
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="text-[14px] font-semibold text-deevo-text-primary leading-snug">
                          {d.recommendation.title.en}
                        </h3>
                        <span className={`text-label ${isImmediate ? "text-red-400" : "text-deevo-text-muted"}`}>
                          {priority.replace(/_/g, " ").toUpperCase()}
                          {" · "}Pressure {d.recommendation.pressure.score.toFixed(0)}
                        </span>
                      </div>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-deevo-accent/6 border border-deevo-accent/15 mb-3">
                      <span className="text-[13px] text-deevo-accent">{d.recommendation.action.en}</span>
                    </div>
                    {d.explanation.why_it_matters?.en && (
                      <p className="text-[13px] text-deevo-text-secondary leading-relaxed mb-2">
                        {d.explanation.why_it_matters.en}
                      </p>
                    )}
                    {d.explanation.why_this_recommendation?.en && (
                      <p className="text-[12px] text-deevo-text-muted leading-relaxed">
                        {d.explanation.why_this_recommendation.en}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        </BriefSection>
      )}

      {/* ════════════════════════════════════════════════════════
          DOCUMENT FOOTER
          ════════════════════════════════════════════════════════ */}
      <div className="mt-12 pt-6 border-t border-deevo-border fade-in-up" style={{ animationDelay: "400ms" }}>
        <div className="text-[11px] text-deevo-text-muted leading-relaxed space-y-2">
          <p>
            This intelligence brief was generated by the Deevo Executive Intelligence Platform.
            All scores, risks, and recommendations are deterministic and traceable through the
            12-stage intelligence pipeline. Zero hallucination. Zero fabricated data.
          </p>
          <p className="font-mono text-[10px]">
            Pipeline: Scenario → Macro → GDP → Country → Sector → Decision → Explanation →
            Graph → Scoring → Risk → KPI → Narrative
          </p>
          <div className="h-0.5 bg-gradient-to-r from-deevo-gold/40 to-transparent mt-4" />
        </div>
      </div>
    </div>
  );
}

// ─── Components ──────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  color,
  note,
}: {
  label: string;
  value: string;
  color: string;
  note: string;
}) {
  return (
    <div className="exec-card rounded-xl p-5">
      <div className="text-label text-deevo-text-muted mb-2">{label}</div>
      <div className={`text-display tabular-nums ${color}`}>{value}</div>
      <div className="text-[10px] text-deevo-text-muted mt-2 leading-snug">{note}</div>
    </div>
  );
}

function BriefSection({
  label,
  delay = 0,
  children,
}: {
  label: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10 fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="briefing-section">
        <div className="section-header-gold mb-4">{label}</div>
        {children}
      </div>
    </section>
  );
}
