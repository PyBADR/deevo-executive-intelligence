"use client";

/**
 * AlertPanel — Threshold-breach alerts with severity glow and attention styling.
 *
 * Visual Design:
 *   - Severity glow on left border (inset box-shadow)
 *   - Critical alerts pulse subtly
 *   - Threshold value shown as a mini-bar
 *   - Category badge
 *   - "Attention Required" flashes when critical alerts exist
 *
 * Data: AlertEngine.evaluate(snapshot, scenarioId)
 */

import { useMemo } from "react";
import { AlertEngine, Alert } from "@/lib/alert-engine";
import { SEVERITY_COLORS } from "@/config/alerts";
import type { ExecutiveSnapshot } from "@/lib/api/client";

interface AlertPanelProps {
  snapshot: ExecutiveSnapshot | null;
  scenarioId: string | null;
  loading?: boolean;
}

const SEVERITY_GLOW: Record<string, string> = {
  critical: "severity-glow-critical",
  high: "severity-glow-high",
  medium: "severity-glow-medium",
  low: "",
};

export function AlertPanel({ snapshot, scenarioId, loading }: AlertPanelProps) {
  const alerts = useMemo(() => {
    if (!snapshot || !scenarioId) return [];
    const engine = new AlertEngine();
    return engine.evaluate(snapshot, scenarioId);
  }, [snapshot, scenarioId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 shimmer rounded" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl shimmer" />
        ))}
      </div>
    );
  }

  const critical = alerts.filter((a) => a.severity === "critical");
  const high = alerts.filter((a) => a.severity === "high");
  const other = alerts.filter((a) => a.severity !== "critical" && a.severity !== "high");

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-deevo-text-primary tracking-tight">
            Alert Monitor
          </h2>
          <span className="text-caption">
            {alerts.length} active · <span className="text-red-400">{critical.length} critical</span>
          </span>
        </div>
      </div>

      {/* Attention banner */}
      {critical.length > 0 && (
        <div className="mb-4 px-3 py-2 rounded-xl bg-red-500/8 border border-red-500/20 attention-flash">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] text-red-400 font-semibold uppercase tracking-wider">
              Attention Required
            </span>
          </div>
          <p className="text-[11px] text-red-400/70 mt-1">
            {critical.length} threshold{critical.length !== 1 ? "s" : ""} breached. Review immediately.
          </p>
        </div>
      )}

      {/* All Clear */}
      {alerts.length === 0 && (
        <div className="exec-card rounded-2xl p-8 text-center">
          <div className="text-emerald-400 text-lg font-semibold mb-1">All Clear</div>
          <div className="text-caption">
            No threshold breaches. All metrics within configured limits.
          </div>
        </div>
      )}

      {/* Alert list */}
      <div className="space-y-2.5">
        {[...critical, ...high, ...other].map((alert, idx) => (
          <AlertRow key={alert.id} alert={alert} idx={idx} />
        ))}
      </div>
    </div>
  );
}

function AlertRow({ alert, idx }: { alert: Alert; idx: number }) {
  const color = SEVERITY_COLORS[alert.severity];
  const isCritical = alert.severity === "critical";
  const glowClass = SEVERITY_GLOW[alert.severity] || "";

  // Threshold breach percentage
  const breachPct = alert.thresholdValue > 0
    ? Math.min((alert.actualValue / alert.thresholdValue) * 100, 150)
    : 100;

  return (
    <div
      className={`exec-card rounded-xl p-3.5 ${glowClass} ${isCritical ? "pulse-critical" : ""} fade-in-up`}
      style={{ animationDelay: `${idx * 40}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-label" style={{ color }}>
            {alert.severity}
          </span>
        </div>
        <span className="text-[10px] text-deevo-text-muted px-1.5 py-0.5 bg-deevo-elevated rounded">
          {alert.category}
        </span>
      </div>

      {/* Name */}
      <div className="text-xs font-medium text-deevo-text-primary mb-1.5 leading-snug">
        {alert.name}
      </div>

      {/* Message */}
      <div className="text-[11px] text-deevo-text-secondary leading-relaxed mb-3">
        {alert.message}
      </div>

      {/* Threshold bar */}
      <div className="relative h-1.5 bg-deevo-elevated rounded-full overflow-hidden mb-2">
        {/* Threshold marker */}
        <div
          className="absolute top-0 h-full w-[2px] bg-deevo-text-muted z-10"
          style={{ left: `${Math.min(100, (100 / breachPct) * 100)}%` }}
        />
        {/* Actual value fill */}
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(breachPct, 100)}%`,
            backgroundColor: color,
            opacity: 0.8,
          }}
        />
      </div>

      {/* Value labels */}
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-deevo-text-muted">
          Actual <span className="font-mono font-medium" style={{ color }}>{alert.actualValue.toFixed(1)}</span>
        </span>
        <span className="text-deevo-text-muted">
          Threshold <span className="font-mono">{alert.thresholdValue}</span>
        </span>
      </div>
    </div>
  );
}
