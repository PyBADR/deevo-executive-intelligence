"use client";

/**
 * Command Center — Executive Decision Interface
 *
 * This is NOT a data dashboard. This is a DECISION INTERFACE.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────┐
 *   │  Score Banner — composite · risk · decisions · confidence │
 *   ├──────────────────────────────────────────────────────────┤
 *   │  KPI Strip — top 5 biggest-movers, large typography      │
 *   ├──────────────┬───────────────────────┬──────────────────┤
 *   │ Intelligence  │ Decision Queue         │ Alert Monitor   │
 *   │ Feed          │ (hero + queue)          │ (severity glow) │
 *   │ col-4         │ col-5                   │ col-3           │
 *   ├──────────────┴───────────────────────┴──────────────────┤
 *   │  Executive Intelligence Brief — classified briefing style │
 *   └──────────────────────────────────────────────────────────┘
 *
 * Data: All from useIntelligence() context. Zero static. Zero mock.
 */

import { useIntelligence } from "@/lib/context/IntelligenceContext";
import { KpiStrip } from "@/components/dashboard/KpiStrip";
import { ScenarioFeed } from "@/components/dashboard/ScenarioFeed";
import { DecisionPanel } from "@/components/dashboard/DecisionPanel";
import { AlertPanel } from "@/components/dashboard/AlertPanel";
import { NarrativePanel } from "@/components/dashboard/NarrativePanel";
import { StartIntelligence } from "@/components/activation/StartIntelligence";
import { DemoGuide } from "@/components/guidance/DemoGuide";
import { ExportPanel } from "@/components/export/ExportPanel";

export default function CommandCenter() {
  const {
    activeScenarioId,
    scenarios,
    scenariosLoading,
    snapshot,
    snapshotLoading,
    triggerIngestion,
    ingestionRunning,
  } = useIntelligence();

  const loading = scenariosLoading || snapshotLoading;
  const kpis = snapshot?.kpi_dashboard?.executive_kpis || [];
  const decisions = snapshot?.decisions || [];
  const scores = snapshot?.scores;
  const risks = snapshot?.risk_register;

  return (
    <div className="p-8 lg:p-10 max-w-[1680px] mx-auto">

      {/* ════════════════════════════════════════════════════════
          SCORE BANNER
          ════════════════════════════════════════════════════════ */}
      <div className="score-banner rounded-2xl p-7 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-deevo-text-primary">
              Command Center
            </h1>
            <p className="text-caption mt-0.5">
              GCC Executive Economic Intelligence · Sovereign-Grade Decision Platform
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeScenarioId && (
              <span className="text-[10px] text-deevo-text-muted font-mono bg-deevo-elevated px-3 py-1.5 rounded-lg">
                {activeScenarioId.slice(0, 20)}
              </span>
            )}
            <ExportPanel />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 shimmer rounded-xl" />
            ))}
          </div>
        ) : scores ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ScoreStat
              label="Composite Score"
              value={scores.overall_score}
              subtitle="Weighted intelligence across all 12 pipeline stages"
            />
            <ScoreStat
              label="Aggregate Risk"
              value={risks?.aggregate_risk_score ?? 0}
              subtitle={`${risks?.critical_count ?? 0} critical · ${risks?.high_count ?? 0} high severity`}
            />
            <CountStat
              label="Active Decisions"
              value={decisions.length}
              highlight={decisions.filter((d) => d.recommendation.priority === "immediate").length}
              highlightLabel="immediate"
            />
            <ScoreStat
              label="Pipeline Confidence"
              value={(scores.confidence ?? 0) * 100}
              subtitle="Deterministic engine output reliability"
            />
          </div>
        ) : (
          <div className="py-4 max-w-md mx-auto">
            <StartIntelligence />
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          KPI STRIP
          ════════════════════════════════════════════════════════ */}
      <div className="mb-8">
        <KpiStrip kpis={kpis} loading={loading} />
      </div>

      {/* ════════════════════════════════════════════════════════
          THREE-COLUMN INTELLIGENCE GRID
          ════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 mb-8">
        {/* Left: Intelligence Feed */}
        <div className="lg:col-span-4">
          <ScenarioFeed
            scenarios={scenarios}
            loading={scenariosLoading}
            onTriggerIngestion={triggerIngestion}
            ingestionRunning={ingestionRunning}
          />
        </div>

        {/* Center: Decision Queue */}
        <div className="lg:col-span-5">
          <DecisionPanel
            decisions={decisions}
            loading={snapshotLoading}
          />
        </div>

        {/* Right: Alert Monitor */}
        <div className="lg:col-span-3">
          <AlertPanel
            snapshot={snapshot}
            scenarioId={activeScenarioId}
            loading={snapshotLoading}
          />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          NARRATIVE BRIEF
          ════════════════════════════════════════════════════════ */}
      <NarrativePanel snapshot={snapshot} loading={snapshotLoading} />

      {/* Demo guide overlay for first-time visitors */}
      {snapshot && <DemoGuide />}
    </div>
  );
}

// ─── Score Stat ─────────────────────────────────────────────────

function ScoreStat({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: number;
  subtitle?: string;
}) {
  const color =
    value >= 60 ? "text-red-400" : value >= 40 ? "text-yellow-400" : "text-emerald-400";

  return (
    <div>
      <div className="text-label text-deevo-text-muted mb-2">{label}</div>
      <div className={`text-display ${color}`}>
        {value.toFixed(1)}
      </div>
      {subtitle && (
        <div className="text-[10px] text-deevo-text-muted mt-2 leading-snug">
          {subtitle}
        </div>
      )}
    </div>
  );
}

// ─── Count Stat ─────────────────────────────────────────────────

function CountStat({
  label,
  value,
  highlight,
  highlightLabel,
}: {
  label: string;
  value: number;
  highlight: number;
  highlightLabel: string;
}) {
  const color = highlight > 2 ? "text-red-400" : highlight > 0 ? "text-yellow-400" : "text-emerald-400";

  return (
    <div>
      <div className="text-label text-deevo-text-muted mb-2">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className={`text-display ${color}`}>{value}</span>
      </div>
      <div className="text-[10px] mt-2">
        <span className="text-red-400 font-medium">{highlight}</span>
        <span className="text-deevo-text-muted"> {highlightLabel}</span>
      </div>
    </div>
  );
}
