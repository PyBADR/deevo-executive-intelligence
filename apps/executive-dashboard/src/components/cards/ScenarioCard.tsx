"use client";

/**
 * Scenario Card — Live intelligence scenario from /scenarios/live
 *
 * Each card represents a real event detected by the ingestion pipeline,
 * classified, clustered, and run through the full 12-stage intelligence pipeline.
 */

interface ScenarioCardProps {
  scenarioId: string;
  title: { en: string; ar: string };
  scenarioType: string;
  severity: string;
  affectedCountries: string[];
  linkedSectors: string[];
  confidence: number;
  sourceCount: number;
  pipeline?: {
    overall_score: number;
    aggregate_risk_score: number;
    decisions_count: number;
    sectors_exposed: number;
    macro_stress: number;
  };
  onSelect?: (id: string) => void;
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/30",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/10 text-green-400 border-green-500/30",
};

export function ScenarioCard({
  scenarioId,
  title,
  scenarioType,
  severity,
  affectedCountries,
  linkedSectors,
  confidence,
  sourceCount,
  pipeline,
  onSelect,
}: ScenarioCardProps) {
  return (
    <div
      className="exec-card rounded-xl bg-deevo-surface p-5 cursor-pointer"
      onClick={() => onSelect?.(scenarioId)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded border ${SEVERITY_STYLES[severity] || SEVERITY_STYLES.medium}`}>
          {severity.toUpperCase()}
        </span>
        <span className="text-xs text-deevo-text-muted font-mono">
          {(confidence * 100).toFixed(0)}% conf
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium mb-3 leading-snug line-clamp-2">
        {title.en}
      </h3>

      {/* Category + Sources */}
      <div className="flex items-center gap-3 mb-3 text-xs text-deevo-text-muted">
        <span className="px-2 py-0.5 bg-deevo-elevated rounded">{scenarioType}</span>
        <span>{sourceCount} source{sourceCount !== 1 ? "s" : ""}</span>
      </div>

      {/* Countries + Sectors */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {affectedCountries.map((c) => (
          <span key={c} className="text-xs px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded">
            {c}
          </span>
        ))}
        {linkedSectors.slice(0, 3).map((s) => (
          <span key={s} className="text-xs px-1.5 py-0.5 bg-deevo-elevated text-deevo-text-secondary rounded">
            {s.replace(/_/g, " ")}
          </span>
        ))}
        {linkedSectors.length > 3 && (
          <span className="text-xs text-deevo-text-muted">+{linkedSectors.length - 3}</span>
        )}
      </div>

      {/* Pipeline Summary (if available) */}
      {pipeline && (
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-deevo-border">
          <PipelineStat label="Score" value={pipeline.overall_score} />
          <PipelineStat label="Risk" value={pipeline.aggregate_risk_score} />
          <PipelineStat label="Stress" value={pipeline.macro_stress} />
        </div>
      )}
    </div>
  );
}

function PipelineStat({ label, value }: { label: string; value: number }) {
  const color = value >= 60 ? "text-red-400" : value >= 40 ? "text-yellow-400" : "text-emerald-400";
  return (
    <div className="text-center">
      <div className={`text-lg font-semibold tabular-nums ${color}`}>
        {value?.toFixed(1) || "—"}
      </div>
      <div className="text-[10px] text-deevo-text-muted uppercase tracking-wider">{label}</div>
    </div>
  );
}
