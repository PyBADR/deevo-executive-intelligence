"use client";

/**
 * Sector Intelligence — 4-Tier Sovereign Exposure Framework
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │  Page Header — title + scenario ID + sector count            │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Tier Summary Strip — 4 tier cards with avg exposure scores  │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Tier 1: Critical Sovereign (sorted by exposure desc)        │
 *   │    Each sector card: exposure, criticality, propagation,     │
 *   │    linked countries, GDP linkage, decision relevance,        │
 *   │    impact drivers, narrative                                 │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Tier 2: Financial & Economic                                │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Tier 3: Market & Growth                                     │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Tier 4: Future & Strategic                                  │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * Data: snapshot.sector_exposures from useIntelligence()
 */

import { useMemo } from "react";
import { useIntelligence } from "@/lib/context/IntelligenceContext";
import type { SectorExposure } from "@/types/sector";

// ─── Tier Metadata ───────────────────────────────────────────────

const TIER_META: Record<number, { name: string; description: string; accent: string; border: string }> = {
  1: { name: "Critical Sovereign", description: "Energy, defense, healthcare — national security sectors", accent: "text-red-400", border: "border-red-500/30" },
  2: { name: "Financial & Economic", description: "Banking, insurance, real estate — economic backbone", accent: "text-orange-400", border: "border-orange-500/20" },
  3: { name: "Market & Growth", description: "Retail, logistics, tourism — growth and diversification", accent: "text-yellow-400", border: "border-yellow-500/15" },
  4: { name: "Future & Strategic", description: "Tech, education, media — Vision 2030 alignment", accent: "text-blue-400", border: "border-blue-500/15" },
};

const PROPAGATION_STYLE: Record<string, { label: string; color: string }> = {
  immediate: { label: "IMMEDIATE", color: "text-red-400" },
  fast:      { label: "FAST",      color: "text-orange-400" },
  medium:    { label: "MEDIUM",    color: "text-yellow-400" },
  slow:      { label: "SLOW",      color: "text-emerald-400" },
};

function exposureColor(v: number): string {
  if (v >= 70) return "text-red-400";
  if (v >= 50) return "text-orange-400";
  if (v >= 30) return "text-yellow-400";
  return "text-emerald-400";
}

function exposureBarGradient(v: number): string {
  if (v >= 70) return "bg-gradient-to-r from-red-600 to-red-400";
  if (v >= 50) return "bg-gradient-to-r from-orange-600 to-orange-400";
  if (v >= 30) return "bg-gradient-to-r from-yellow-600 to-yellow-400";
  return "bg-gradient-to-r from-emerald-600 to-emerald-400";
}

// ─── Page ────────────────────────────────────────────────────────

export default function SectorIntelligencePage() {
  const {
    snapshot,
    snapshotLoading,
    scenariosLoading,
    activeScenarioId,
    triggerIngestion,
    ingestionRunning,
  } = useIntelligence();

  const loading = scenariosLoading || snapshotLoading;
  const exposures = snapshot?.sector_exposures?.exposures || [];
  const tierSummary = snapshot?.sector_exposures?.tier_summary || {};
  const decisions = snapshot?.decisions || [];

  // Group by tier
  const byTier = useMemo(() => {
    const grouped: Record<number, SectorExposure[]> = { 1: [], 2: [], 3: [], 4: [] };
    for (const e of exposures) {
      const tier = e.tier || 4;
      if (!grouped[tier]) grouped[tier] = [];
      grouped[tier].push(e);
    }
    // Sort each tier by exposure_score descending
    for (const tier of Object.keys(grouped)) {
      grouped[Number(tier)].sort((a, b) => b.exposure_score - a.exposure_score);
    }
    return grouped;
  }, [exposures]);

  return (
    <div className="p-8 lg:p-10 max-w-[1680px] mx-auto">

      {/* ════════════════════════════════════════════════════════
          PAGE HEADER
          ════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-deevo-text-primary">
            Sector Intelligence
          </h1>
          <p className="text-caption mt-0.5">
            4-Tier, 20-Sector Sovereign Exposure Framework · Criticality-Adjusted Analysis
          </p>
        </div>
        {activeScenarioId && (
          <span className="text-[10px] text-deevo-text-muted font-mono bg-deevo-elevated px-3 py-1.5 rounded-lg">
            {activeScenarioId.slice(0, 20)}
          </span>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          TIER SUMMARY STRIP
          ════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 shimmer rounded-2xl" />
          ))}
        </div>
      ) : exposures.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((tier) => {
            const meta = TIER_META[tier];
            const tierKey = Object.keys(tierSummary).find((k) => k.includes(String(tier))) || "";
            const avgExposure = tierSummary[tierKey] ?? (
              byTier[tier].length > 0
                ? byTier[tier].reduce((s, e) => s + e.exposure_score, 0) / byTier[tier].length
                : 0
            );
            return (
              <div key={tier} className={`exec-card rounded-xl p-4 border-l-2 ${meta.border} fade-in-up`} style={{ animationDelay: `${tier * 50}ms` }}>
                <div className="text-label text-deevo-text-muted mb-1">TIER {tier}</div>
                <div className={`text-headline tabular-nums ${exposureColor(avgExposure)}`}>
                  {avgExposure.toFixed(1)}
                </div>
                <div className="text-[11px] text-deevo-text-secondary mt-1">{meta.name}</div>
                <div className="text-[10px] text-deevo-text-muted mt-0.5">
                  {byTier[tier].length} sector{byTier[tier].length !== 1 ? "s" : ""}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* ════════════════════════════════════════════════════════
          SECTOR TIERS
          ════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="space-y-8">
          {[...Array(2)].map((_, i) => (
            <div key={i}>
              <div className="h-5 w-48 shimmer rounded mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-48 shimmer rounded-2xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : exposures.length === 0 ? (
        <div className="exec-card rounded-2xl p-12 text-center">
          <div className="text-sm text-deevo-text-muted mb-2">No sector exposure data available</div>
          <p className="text-caption mb-4">
            Sector analysis generates when the intelligence pipeline processes a scenario.
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
        <div className="space-y-10">
          {[1, 2, 3, 4].map((tier) => {
            const sectors = byTier[tier];
            if (sectors.length === 0) return null;
            const meta = TIER_META[tier];
            return (
              <div key={tier} className="fade-in-up" style={{ animationDelay: `${tier * 80}ms` }}>
                {/* Tier header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-1 h-6 rounded-full ${meta.border.replace("border-", "bg-").replace("/30", "").replace("/20", "").replace("/15", "")}`} style={{ backgroundColor: tier === 1 ? "rgb(239,68,68)" : tier === 2 ? "rgb(249,115,22)" : tier === 3 ? "rgb(234,179,8)" : "rgb(59,130,246)" }} />
                  <div>
                    <h2 className={`text-sm font-semibold tracking-tight ${meta.accent}`}>
                      Tier {tier} — {meta.name}
                    </h2>
                    <span className="text-caption">{meta.description}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {sectors.map((sector, idx) => (
                    <SectorCard
                      key={sector.sector_code}
                      sector={sector}
                      decisionCount={decisions.filter((d) =>
                        d.recommendation.affected_entities.some((e) =>
                          e.toLowerCase().includes(sector.sector_code.toLowerCase().replace(/_/g, " ")) ||
                          e.toLowerCase().includes(sector.sector_code.toLowerCase())
                        )
                      ).length}
                      idx={idx}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Sector Card ─────────────────────────────────────────────────

function SectorCard({
  sector,
  decisionCount,
  idx,
}: {
  sector: SectorExposure;
  decisionCount: number;
  idx: number;
}) {
  const propagation = PROPAGATION_STYLE[sector.propagation_speed] || PROPAGATION_STYLE.medium;
  const displayName = sector.sector_code.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div
      className="exec-card rounded-xl overflow-hidden fade-in-up"
      style={{ animationDelay: `${idx * 40}ms` }}
    >
      {/* Exposure bar */}
      <div className="pressure-bar">
        <div
          className={`pressure-bar-fill ${exposureBarGradient(sector.exposure_score)}`}
          style={{ width: `${Math.min(sector.exposure_score, 100)}%` }}
        />
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-medium text-deevo-text-primary">{displayName}</h3>
          <div className={`text-sm font-mono font-semibold tabular-nums ${exposureColor(sector.exposure_score)}`}>
            {sector.exposure_score.toFixed(1)}
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <div className="text-label text-deevo-text-muted">Criticality</div>
            <div className={`text-[13px] font-mono tabular-nums ${exposureColor(sector.criticality_adjusted_score)}`}>
              {sector.criticality_adjusted_score.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-label text-deevo-text-muted">Decision Rel.</div>
            <div className={`text-[13px] font-mono tabular-nums ${exposureColor(sector.decision_relevance)}`}>
              {sector.decision_relevance.toFixed(0)}
            </div>
          </div>
          <div>
            <div className="text-label text-deevo-text-muted">Speed</div>
            <div className={`text-[11px] font-semibold ${propagation.color}`}>
              {propagation.label}
            </div>
          </div>
        </div>

        {/* Country context */}
        {sector.country_context.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {sector.country_context.map((cc) => (
              <span key={cc} className="text-[10px] px-1.5 py-0.5 bg-blue-500/8 text-blue-400 rounded">
                {cc}
              </span>
            ))}
            {sector.gdp_linkage.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 bg-deevo-elevated text-deevo-text-muted rounded">
                GDP: {sector.gdp_linkage.join(", ")}
              </span>
            )}
          </div>
        )}

        {/* Impact drivers */}
        {sector.impact_drivers.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {sector.impact_drivers.slice(0, 3).map((driver, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-deevo-elevated text-deevo-text-secondary rounded">
                {driver}
              </span>
            ))}
            {sector.impact_drivers.length > 3 && (
              <span className="text-[10px] text-deevo-text-muted">+{sector.impact_drivers.length - 3}</span>
            )}
          </div>
        )}

        {/* Decision count */}
        {decisionCount > 0 && (
          <div className="text-[10px] text-deevo-text-muted mb-2">
            <span className="text-deevo-accent font-medium">{decisionCount}</span> linked decision{decisionCount !== 1 ? "s" : ""}
          </div>
        )}

        {/* Narrative */}
        {sector.narrative?.en && (
          <p className="text-[11px] text-deevo-text-secondary leading-relaxed line-clamp-2">
            {sector.narrative.en}
          </p>
        )}
      </div>
    </div>
  );
}
