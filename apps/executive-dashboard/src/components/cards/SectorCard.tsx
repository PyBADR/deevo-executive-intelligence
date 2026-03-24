"use client";

/**
 * Sector Card — 4-Tier sector exposure display.
 *
 * Maps to: SectorExposure from /sectors/exposure
 * Shows tier, exposure, criticality-adjusted score, propagation speed.
 */

interface SectorCardProps {
  sectorCode: string;
  tier: number;
  exposureScore: number;
  criticalityAdjustedScore: number;
  propagationSpeed: string;
  impactDrivers: string[];
  narrative: string;
}

const TIER_LABELS: Record<number, { name: string; color: string }> = {
  1: { name: "Critical Sovereign", color: "text-red-400 bg-red-500/10 border-red-500/30" },
  2: { name: "Financial & Economic", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
  3: { name: "Market & Growth", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  4: { name: "Future & Strategic", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
};

const SPEED_COLORS: Record<string, string> = {
  immediate: "text-red-400",
  fast: "text-orange-400",
  medium: "text-yellow-400",
  slow: "text-blue-400",
};

export function SectorCard({
  sectorCode,
  tier,
  exposureScore,
  criticalityAdjustedScore,
  propagationSpeed,
  impactDrivers,
  narrative,
}: SectorCardProps) {
  const tierInfo = TIER_LABELS[tier] || TIER_LABELS[4];
  const expColor = exposureScore >= 50 ? "text-red-400" : exposureScore >= 30 ? "text-yellow-400" : "text-emerald-400";

  return (
    <div className="exec-card rounded-xl bg-deevo-surface p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded border ${tierInfo.color}`}>
            Tier {tier}
          </span>
          <h3 className="text-sm font-semibold mt-2">
            {sectorCode.replace(/_/g, " ")}
          </h3>
        </div>
        <span className={`text-xs font-mono ${SPEED_COLORS[propagationSpeed] || "text-deevo-text-muted"}`}>
          {propagationSpeed}
        </span>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div className="text-[10px] text-deevo-text-muted uppercase tracking-wider mb-1">Exposure</div>
          <div className={`text-xl font-semibold tabular-nums ${expColor}`}>
            {exposureScore.toFixed(1)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-deevo-text-muted uppercase tracking-wider mb-1">Adjusted</div>
          <div className="text-xl font-semibold tabular-nums text-deevo-gold">
            {criticalityAdjustedScore.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Drivers */}
      {impactDrivers.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {impactDrivers.slice(0, 4).map((d) => (
            <span key={d} className="text-[10px] px-1.5 py-0.5 bg-deevo-elevated rounded text-deevo-text-muted">
              {d}
            </span>
          ))}
        </div>
      )}

      {/* Narrative */}
      <p className="text-xs text-deevo-text-secondary leading-relaxed line-clamp-2">{narrative}</p>
    </div>
  );
}
