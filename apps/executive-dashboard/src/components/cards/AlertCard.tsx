"use client";

/**
 * Alert Card — Threshold-triggered intelligence alert.
 *
 * Maps to: Alert output from AlertEngine.evaluate()
 */

import { SEVERITY_COLORS } from "@/config/alerts";

interface AlertCardProps {
  name: string;
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  message: string;
  actualValue: number;
  thresholdValue: number;
  triggeredAt: string;
}

export function AlertCard({
  name,
  severity,
  category,
  message,
  actualValue,
  thresholdValue,
  triggeredAt,
}: AlertCardProps) {
  const color = SEVERITY_COLORS[severity];
  const isCritical = severity === "critical";

  return (
    <div
      className={`exec-card rounded-xl bg-deevo-surface p-5 border-l-4 ${isCritical ? "pulse-critical" : ""}`}
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color }}>
            {severity}
          </span>
        </div>
        <span className="text-xs text-deevo-text-muted px-2 py-0.5 bg-deevo-elevated rounded">
          {category}
        </span>
      </div>

      <h3 className="text-sm font-semibold mb-2">{name}</h3>
      <p className="text-xs text-deevo-text-secondary mb-3">{message}</p>

      <div className="flex items-center justify-between text-xs text-deevo-text-muted pt-3 border-t border-deevo-border">
        <span>
          Actual: <span className="font-mono" style={{ color }}>{actualValue.toFixed(1)}</span>
          {" / "}
          Threshold: <span className="font-mono">{thresholdValue}</span>
        </span>
        <span>{new Date(triggeredAt).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
