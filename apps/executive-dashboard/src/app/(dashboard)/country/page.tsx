"use client";

/**
 * Country Intelligence — GCC Sovereign Economic Assessment
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │  Page Header — title + active scenario + country count       │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Summary Strip — aggregate macro sensitivity, risk dist      │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Country Cards (2×3 grid) — each shows:                     │
 *   │    • Macro sensitivity score (color-coded)                   │
 *   │    • Risk level badge                                        │
 *   │    • Public/Private sector split (dual bars)                 │
 *   │    • GDP impact aggregate                                    │
 *   │    • Top linked sectors                                      │
 *   │    • Country KPIs                                            │
 *   │    • Decision pressure (immediate count)                     │
 *   │    • Narrative excerpt                                       │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * Data: All from useIntelligence() context — snapshot.country_impacts,
 *       snapshot.kpi_dashboard.country_kpis, snapshot.decisions,
 *       snapshot.sector_exposures
 */

import { useMemo } from "react";
import { useIntelligence } from "@/lib/context/IntelligenceContext";
import type { CountryImpact } from "@/types/country";
import type { CountryKPI } from "@/types/kpi";
import type { ExplainedDecision } from "@/types/decision";
import type { SectorExposure } from "@/types/sector";
import type { GCCCountryCode } from "@/types/scenario";

// ─── Country Metadata ────────────────────────────────────────────

const COUNTRY_META: Record<GCCCountryCode, { name: string; flag: string }> = {
  SA: { name: "Saudi Arabia", flag: "🇸🇦" },
  AE: { name: "United Arab Emirates", flag: "🇦🇪" },
  KW: { name: "Kuwait", flag: "🇰🇼" },
  QA: { name: "Qatar", flag: "🇶🇦" },
  BH: { name: "Bahrain", flag: "🇧🇭" },
  OM: { name: "Oman", flag: "🇴🇲" },
};

const RISK_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "CRITICAL", color: "text-red-400", bg: "bg-red-500/10" },
  high:     { label: "HIGH",     color: "text-orange-400", bg: "bg-orange-500/10" },
  elevated: { label: "ELEVATED", color: "text-yellow-400", bg: "bg-yellow-500/8" },
  moderate: { label: "MODERATE", color: "text-blue-400", bg: "bg-blue-500/8" },
  stable:   { label: "STABLE",   color: "text-emerald-400", bg: "bg-emerald-500/8" },
};

function sensitivityColor(v: number): string {
  if (v >= 70) return "text-red-400";
  if (v >= 50) return "text-orange-400";
  if (v >= 30) return "text-yellow-400";
  return "text-emerald-400";
}

function barColor(v: number): string {
  if (v >= 70) return "bg-red-400";
  if (v >= 50) return "bg-orange-400";
  if (v >= 30) return "bg-yellow-400";
  return "bg-emerald-400";
}

// ─── Page ────────────────────────────────────────────────────────

export default function CountryIntelligencePage() {
  const {
    snapshot,
    snapshotLoading,
    scenariosLoading,
    activeScenarioId,
    triggerIngestion,
    ingestionRunning,
  } = useIntelligence();

  const loading = scenariosLoading || snapshotLoading;
  const countries = snapshot?.country_impacts || [];
  const countryKpis = snapshot?.kpi_dashboard?.country_kpis || [];
  const decisions = snapshot?.decisions || [];
  const sectorExposures = snapshot?.sector_exposures?.exposures || [];

  // Aggregate stats
  const avgSensitivity = useMemo(() => {
    if (countries.length === 0) return 0;
    return countries.reduce((s, c) => s + c.macro_sensitivity, 0) / countries.length;
  }, [countries]);

  const riskDist = useMemo(() => {
    const dist: Record<string, number> = {};
    countries.forEach((c) => {
      dist[c.risk_level] = (dist[c.risk_level] || 0) + 1;
    });
    return dist;
  }, [countries]);

  return (
    <div className="p-8 lg:p-10 max-w-[1680px] mx-auto">

      {/* ════════════════════════════════════════════════════════
          PAGE HEADER
          ════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-deevo-text-primary">
            Country Intelligence
          </h1>
          <p className="text-caption mt-0.5">
            GCC Sovereign Economic Assessment · 6-Country Macro Sensitivity Analysis
          </p>
        </div>
        {activeScenarioId && (
          <span className="text-[10px] text-deevo-text-muted font-mono bg-deevo-elevated px-3 py-1.5 rounded-lg">
            {activeScenarioId.slice(0, 20)}
          </span>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          SUMMARY STRIP
          ════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="h-20 shimmer rounded-2xl mb-8" />
      ) : countries.length > 0 ? (
        <div className="score-banner rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-label text-deevo-text-muted mb-1.5">Countries Assessed</div>
              <div className="text-display text-deevo-text-primary">{countries.length}</div>
            </div>
            <div>
              <div className="text-label text-deevo-text-muted mb-1.5">Avg Macro Sensitivity</div>
              <div className={`text-display ${sensitivityColor(avgSensitivity)}`}>
                {avgSensitivity.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-label text-deevo-text-muted mb-1.5">Risk Distribution</div>
              <div className="flex items-center gap-2 mt-1">
                {Object.entries(riskDist).map(([level, count]) => {
                  const s = RISK_STYLE[level] || RISK_STYLE.stable;
                  return (
                    <span key={level} className={`text-[10px] px-2 py-0.5 rounded ${s.bg} ${s.color}`}>
                      {count} {s.label}
                    </span>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-label text-deevo-text-muted mb-1.5">Active Decisions</div>
              <div className="text-display text-deevo-text-primary">{decisions.length}</div>
              <div className="text-[10px] text-red-400 mt-0.5">
                {decisions.filter((d) => d.recommendation.priority === "immediate").length} immediate
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ════════════════════════════════════════════════════════
          COUNTRY GRID
          ════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 shimmer rounded-2xl" />
          ))}
        </div>
      ) : countries.length === 0 ? (
        <div className="exec-card rounded-2xl p-12 text-center">
          <div className="text-sm text-deevo-text-muted mb-2">No country intelligence available</div>
          <p className="text-caption mb-4">
            Country assessments generate when the intelligence pipeline processes a scenario.
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...countries]
            .sort((a, b) => b.macro_sensitivity - a.macro_sensitivity)
            .map((country, idx) => (
              <CountryCard
                key={country.country_code}
                country={country}
                kpis={countryKpis.filter((k) => k.country_code === country.country_code)}
                decisions={decisions.filter((d) =>
                  d.recommendation.affected_entities.some((e) =>
                    e.toLowerCase().includes(country.country_code.toLowerCase()) ||
                    e.toLowerCase().includes(COUNTRY_META[country.country_code]?.name.toLowerCase() || "")
                  )
                )}
                sectors={sectorExposures.filter((s) =>
                  s.country_context.includes(country.country_code)
                )}
                idx={idx}
              />
            ))}
        </div>
      )}
    </div>
  );
}

// ─── Country Card ────────────────────────────────────────────────

function CountryCard({
  country,
  kpis,
  decisions,
  sectors,
  idx,
}: {
  country: CountryImpact;
  kpis: CountryKPI[];
  decisions: ExplainedDecision[];
  sectors: SectorExposure[];
  idx: number;
}) {
  const meta = COUNTRY_META[country.country_code] || { name: country.country_code, flag: "" };
  const risk = RISK_STYLE[country.risk_level] || RISK_STYLE.stable;
  const pub = country.public_sector;
  const priv = country.private_sector;

  const pubAvg = avg([pub.spending_pressure, pub.policy_sensitivity, pub.infrastructure_continuity, pub.regulatory_sensitivity]);
  const privAvg = avg([priv.operating_cost_pressure, priv.financing_pressure, priv.demand_pressure, priv.investment_sentiment, priv.startup_sensitivity]);

  const immediateDecisions = decisions.filter((d) => d.recommendation.priority === "immediate");
  const topSectors = [...sectors].sort((a, b) => b.exposure_score - a.exposure_score).slice(0, 3);
  const gdpAggregate = country.gdp_impact?.aggregate_impact ?? 0;

  return (
    <div
      className="exec-card rounded-2xl overflow-hidden fade-in-up"
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      {/* Header — Country name + risk badge + sensitivity */}
      <div className="px-5 py-4 bg-deevo-elevated/50 border-b border-deevo-border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">{meta.flag}</span>
            <div>
              <h3 className="text-sm font-semibold text-deevo-text-primary tracking-tight">
                {meta.name}
              </h3>
              <span className="text-[10px] text-deevo-text-muted font-mono">{country.country_code}</span>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-headline tabular-nums ${sensitivityColor(country.macro_sensitivity)}`}>
              {country.macro_sensitivity.toFixed(1)}
            </div>
            <div className="text-label text-deevo-text-muted mt-0.5">Sensitivity</div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Risk level + GDP impact + confidence */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-label px-2 py-0.5 rounded ${risk.bg} ${risk.color}`}>
            {risk.label}
          </span>
          {gdpAggregate !== 0 && (
            <span className={`text-[10px] px-2 py-0.5 rounded ${
              gdpAggregate < 0 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/8 text-emerald-400"
            }`}>
              GDP {gdpAggregate > 0 ? "+" : ""}{(gdpAggregate * 100).toFixed(1)}%
            </span>
          )}
          <span className="text-[10px] text-deevo-text-muted font-mono ml-auto">
            {(country.confidence * 100).toFixed(0)}% conf
          </span>
        </div>

        {/* Public / Private Sector Split */}
        <div className="space-y-2.5">
          <SectorBar label="Public Sector" value={pubAvg} sublabel={`Spend ${pub.spending_pressure.toFixed(0)} · Policy ${pub.policy_sensitivity.toFixed(0)} · Infra ${pub.infrastructure_continuity.toFixed(0)} · Reg ${pub.regulatory_sensitivity.toFixed(0)}`} />
          <SectorBar label="Private Sector" value={privAvg} sublabel={`Ops ${priv.operating_cost_pressure.toFixed(0)} · Finance ${priv.financing_pressure.toFixed(0)} · Demand ${priv.demand_pressure.toFixed(0)} · Invest ${priv.investment_sentiment.toFixed(0)}`} />
        </div>

        {/* Top Sectors */}
        {topSectors.length > 0 && (
          <div>
            <div className="text-label text-deevo-text-muted mb-1.5">Top Exposed Sectors</div>
            <div className="flex flex-wrap gap-1.5">
              {topSectors.map((s) => (
                <span
                  key={s.sector_code}
                  className="text-[10px] px-2 py-0.5 bg-deevo-elevated text-deevo-text-secondary rounded-md"
                >
                  {s.sector_code.replace(/_/g, " ")}
                  <span className={`ml-1 font-mono ${sensitivityColor(s.exposure_score)}`}>
                    {s.exposure_score.toFixed(0)}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Country KPIs */}
        {kpis.length > 0 && (
          <div>
            <div className="text-label text-deevo-text-muted mb-1.5">Key Indicators</div>
            <div className="space-y-1">
              {kpis.slice(0, 3).map((kpi) => {
                const trendColor = kpi.trend.direction === "up"
                  ? "text-red-400"
                  : kpi.trend.direction === "down"
                  ? "text-emerald-400"
                  : "text-deevo-text-muted";
                return (
                  <div key={kpi.kpi_id} className="flex items-center justify-between text-[11px]">
                    <span className="text-deevo-text-secondary">{kpi.name.en}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-deevo-text-primary">{kpi.value.toFixed(1)}{kpi.unit}</span>
                      <span className={`font-mono ${trendColor}`}>
                        {kpi.trend.direction === "up" ? "↑" : kpi.trend.direction === "down" ? "↓" : "→"}
                        {Math.abs(kpi.trend.change_pct).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Decision Pressure */}
        {decisions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-label text-deevo-text-muted">Decisions</span>
            <span className="text-[11px] text-deevo-text-secondary">{decisions.length} linked</span>
            {immediateDecisions.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded font-medium">
                {immediateDecisions.length} immediate
              </span>
            )}
          </div>
        )}

        {/* Narrative */}
        {country.narrative?.en && (
          <div className="briefing-section">
            <div className="section-header-gold mb-1.5">Assessment</div>
            <p className="text-[11px] text-deevo-text-secondary leading-relaxed line-clamp-3">
              {country.narrative.en}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sector Pressure Bar ─────────────────────────────────────────

function SectorBar({ label, value, sublabel }: { label: string; value: number; sublabel: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-deevo-text-secondary">{label}</span>
        <span className={`text-[11px] font-mono font-medium ${sensitivityColor(value)}`}>
          {value.toFixed(1)}
        </span>
      </div>
      <div className="relative h-1.5 bg-deevo-elevated rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor(value)}`}
          style={{ width: `${Math.min(value, 100)}%`, opacity: 0.8 }}
        />
      </div>
      <div className="text-[9px] text-deevo-text-muted mt-0.5">{sublabel}</div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────

function avg(values: number[]): number {
  const valid = values.filter((v) => v !== undefined && v !== null);
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
}
