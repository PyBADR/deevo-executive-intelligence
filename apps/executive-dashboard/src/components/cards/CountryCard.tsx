"use client";

/**
 * Country Card — GCC country intelligence summary.
 *
 * Maps to: CountryImpact from /countries/{code}
 * Shows public/private split, macro sensitivity, risk level.
 */

interface CountryCardProps {
  countryCode: string;
  macroSensitivity: number;
  riskLevel: string;
  publicPressure: number;   // avg of public sector metrics
  privatePressure: number;  // avg of private sector metrics
  narrative: string;
  onSelect?: (code: string) => void;
}

const COUNTRY_NAMES: Record<string, string> = {
  SA: "Saudi Arabia",
  AE: "UAE",
  KW: "Kuwait",
  QA: "Qatar",
  BH: "Bahrain",
  OM: "Oman",
};

const RISK_COLORS: Record<string, string> = {
  critical: "text-red-400",
  high: "text-orange-400",
  elevated: "text-yellow-400",
  moderate: "text-blue-400",
  stable: "text-emerald-400",
};

export function CountryCard({
  countryCode,
  macroSensitivity,
  riskLevel,
  publicPressure,
  privatePressure,
  narrative,
  onSelect,
}: CountryCardProps) {
  const sensColor = macroSensitivity >= 60 ? "text-red-400" : macroSensitivity >= 40 ? "text-yellow-400" : "text-emerald-400";

  return (
    <div
      className="exec-card rounded-xl bg-deevo-surface p-5 cursor-pointer"
      onClick={() => onSelect?.(countryCode)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs text-deevo-gold font-mono">{countryCode}</span>
          <h3 className="text-sm font-semibold">{COUNTRY_NAMES[countryCode] || countryCode}</h3>
        </div>
        <span className={`text-xs font-medium ${RISK_COLORS[riskLevel] || "text-deevo-text-muted"}`}>
          {riskLevel.toUpperCase()}
        </span>
      </div>

      {/* Macro Sensitivity */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-semibold tabular-nums ${sensColor}`}>
            {macroSensitivity.toFixed(1)}
          </span>
          <span className="text-xs text-deevo-text-muted">/100 sensitivity</span>
        </div>
      </div>

      {/* Public / Private Split */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-deevo-elevated rounded-lg p-3">
          <div className="text-[10px] text-deevo-text-muted uppercase tracking-wider mb-1">Public</div>
          <div className="text-lg font-semibold tabular-nums">{publicPressure.toFixed(1)}</div>
        </div>
        <div className="bg-deevo-elevated rounded-lg p-3">
          <div className="text-[10px] text-deevo-text-muted uppercase tracking-wider mb-1">Private</div>
          <div className="text-lg font-semibold tabular-nums">{privatePressure.toFixed(1)}</div>
        </div>
      </div>

      {/* Narrative */}
      <p className="text-xs text-deevo-text-secondary leading-relaxed line-clamp-2">
        {narrative}
      </p>
    </div>
  );
}
