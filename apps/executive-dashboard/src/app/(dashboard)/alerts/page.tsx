"use client";

/**
 * Alert Center — Real-Time Threshold Monitoring System
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │  Header — alert count + severity distribution + refresh      │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Severity Filter Strip — all / critical / high / medium      │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Category Filter — all / decision / sector / country / risk  │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Attention Banner (if critical alerts exist)                 │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Alert Cards with:                                           │
 *   │    • Severity glow + pulse for critical                      │
 *   │    • Threshold bar (actual vs threshold)                     │
 *   │    • Category badge                                          │
 *   │    • Acknowledge/Mute placeholders (SaaS-ready)              │
 *   │    • Timestamp                                               │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  All Clear state (when no alerts)                            │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Threshold Rules Reference — configured rules grid           │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * Data: AlertEngine.evaluate(snapshot, scenarioId) via useIntelligence()
 */

import { useMemo, useState, useCallback } from "react";
import { useIntelligence } from "@/lib/context/IntelligenceContext";
import { AlertEngine, Alert } from "@/lib/alert-engine";
import { ALERT_THRESHOLDS, SEVERITY_COLORS, SEVERITY_ORDER } from "@/config/alerts";

// ─── Types ───────────────────────────────────────────────────────

type SeverityFilter = "all" | "critical" | "high" | "medium" | "low";
type CategoryFilter = "all" | "decision" | "sector" | "country" | "risk" | "macro";

// Alert state model — SaaS-ready structure
interface AlertState {
  acknowledged: Set<string>;
  muted: Set<string>;
}

const SEVERITY_GLOW: Record<string, string> = {
  critical: "severity-glow-critical",
  high: "severity-glow-high",
  medium: "severity-glow-medium",
  low: "",
};

// ─── Page ────────────────────────────────────────────────────────

export default function AlertCenterPage() {
  const {
    snapshot,
    snapshotLoading,
    scenariosLoading,
    activeScenarioId,
    refresh,
    triggerIngestion,
    ingestionRunning,
  } = useIntelligence();

  const loading = scenariosLoading || snapshotLoading;
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  // Alert state model (in-memory for now — SaaS tier will persist)
  const [alertState, setAlertState] = useState<AlertState>({
    acknowledged: new Set(),
    muted: new Set(),
  });

  // Evaluate alerts from pipeline output
  const alerts = useMemo(() => {
    if (!snapshot || !activeScenarioId) return [];
    const engine = new AlertEngine();
    return engine.evaluate(snapshot, activeScenarioId);
  }, [snapshot, activeScenarioId]);

  // Apply filters
  const filtered = useMemo(() => {
    let result = alerts;
    // Exclude muted alerts
    result = result.filter((a) => !alertState.muted.has(a.thresholdId));
    if (severityFilter !== "all") {
      result = result.filter((a) => a.severity === severityFilter);
    }
    if (categoryFilter !== "all") {
      result = result.filter((a) => a.category === categoryFilter);
    }
    return result;
  }, [alerts, severityFilter, categoryFilter, alertState.muted]);

  // Severity counts (before filtering)
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: alerts.length };
    for (const a of alerts) {
      if (!alertState.muted.has(a.thresholdId)) {
        c[a.severity] = (c[a.severity] || 0) + 1;
      }
    }
    return c;
  }, [alerts, alertState.muted]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = { all: alerts.length };
    for (const a of alerts) {
      if (!alertState.muted.has(a.thresholdId)) {
        c[a.category] = (c[a.category] || 0) + 1;
      }
    }
    return c;
  }, [alerts, alertState.muted]);

  const criticalCount = counts.critical || 0;

  // Actions
  const acknowledgeAlert = useCallback((thresholdId: string) => {
    setAlertState((prev) => ({
      ...prev,
      acknowledged: new Set(Array.from(prev.acknowledged).concat(thresholdId)),
    }));
  }, []);

  const muteAlert = useCallback((thresholdId: string) => {
    setAlertState((prev) => ({
      ...prev,
      muted: new Set(Array.from(prev.muted).concat(thresholdId)),
    }));
  }, []);

  const unmuteAll = useCallback(() => {
    setAlertState((prev) => ({
      ...prev,
      muted: new Set(),
    }));
  }, []);

  const SEVERITY_FILTERS: { key: SeverityFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "critical", label: "Critical" },
    { key: "high", label: "High" },
    { key: "medium", label: "Medium" },
  ];

  const CATEGORY_FILTERS: { key: CategoryFilter; label: string }[] = [
    { key: "all", label: "All Categories" },
    { key: "decision", label: "Decision" },
    { key: "sector", label: "Sector" },
    { key: "country", label: "Country" },
    { key: "risk", label: "Risk" },
    { key: "macro", label: "Macro" },
  ];

  return (
    <div className="p-8 lg:p-10 max-w-[1200px] mx-auto">

      {/* ════════════════════════════════════════════════════════
          PAGE HEADER
          ════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-deevo-text-primary">
            Alert Center
          </h1>
          <p className="text-caption mt-0.5">
            Threshold-Based Intelligence Monitoring · {ALERT_THRESHOLDS.length} Active Rules
          </p>
        </div>
        <div className="flex items-center gap-3">
          {alertState.muted.size > 0 && (
            <button
              onClick={unmuteAll}
              className="text-[11px] px-3 py-1.5 text-deevo-text-muted hover:text-deevo-text-secondary transition-colors"
            >
              Unmute all ({alertState.muted.size})
            </button>
          )}
          <button
            onClick={refresh}
            className="text-[11px] px-3 py-1.5 bg-deevo-elevated text-deevo-text-secondary rounded-lg hover:bg-deevo-elevated/80 transition-colors border border-deevo-border"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary bar */}
      {!loading && alerts.length > 0 && (
        <div className="score-banner rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-8 flex-wrap">
            <div>
              <div className="text-label text-deevo-text-muted mb-1">Active Alerts</div>
              <div className="text-headline text-deevo-text-primary">{alerts.length - alertState.muted.size}</div>
            </div>
            {(["critical", "high", "medium"] as const).map((sev) => {
              const c = counts[sev] || 0;
              if (c === 0) return null;
              return (
                <div key={sev}>
                  <div className="text-label text-deevo-text-muted mb-1">{sev.toUpperCase()}</div>
                  <div className="text-headline tabular-nums" style={{ color: SEVERITY_COLORS[sev] }}>
                    {c}
                  </div>
                </div>
              );
            })}
            {alertState.muted.size > 0 && (
              <div>
                <div className="text-label text-deevo-text-muted mb-1">MUTED</div>
                <div className="text-headline tabular-nums text-deevo-text-muted">{alertState.muted.size}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          FILTER STRIPS
          ════════════════════════════════════════════════════════ */}
      {!loading && alerts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Severity filters */}
          {SEVERITY_FILTERS.map((f) => {
            const isActive = severityFilter === f.key;
            const count = f.key === "all" ? (alerts.length - alertState.muted.size) : (counts[f.key] || 0);
            return (
              <button
                key={f.key}
                onClick={() => setSeverityFilter(f.key)}
                className={`text-[11px] px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-deevo-elevated text-deevo-text-primary border border-deevo-border"
                    : "text-deevo-text-muted hover:text-deevo-text-secondary border border-transparent"
                }`}
              >
                {f.label} <span className="font-mono ml-1 opacity-60">{count}</span>
              </button>
            );
          })}

          <span className="w-px h-4 bg-deevo-border mx-1" />

          {/* Category filters */}
          {CATEGORY_FILTERS.map((f) => {
            const isActive = categoryFilter === f.key;
            const count = categoryCounts[f.key] || 0;
            if (f.key !== "all" && count === 0) return null;
            return (
              <button
                key={f.key}
                onClick={() => setCategoryFilter(f.key)}
                className={`text-[11px] px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-deevo-elevated text-deevo-text-primary border border-deevo-border"
                    : "text-deevo-text-muted hover:text-deevo-text-secondary border border-transparent"
                }`}
              >
                {f.label} {f.key !== "all" && <span className="font-mono ml-1 opacity-60">{count}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          ATTENTION BANNER
          ════════════════════════════════════════════════════════ */}
      {!loading && criticalCount > 0 && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20 attention-flash fade-in-up">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] text-red-400 font-semibold uppercase tracking-wider">
              Attention Required
            </span>
          </div>
          <p className="text-[12px] text-red-400/80 mt-1">
            {criticalCount} critical threshold{criticalCount !== 1 ? "s" : ""} breached.
            Review and acknowledge immediately.
          </p>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          ALERT LIST / ALL CLEAR / LOADING
          ════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 shimmer rounded-2xl" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="exec-card rounded-2xl p-12 text-center fade-in-up">
          <div className="text-emerald-400 text-3xl font-semibold mb-2">All Clear</div>
          <div className="text-sm text-deevo-text-muted mb-1">
            No threshold breaches detected.
          </div>
          <div className="text-caption">
            All {ALERT_THRESHOLDS.length} monitoring rules are within configured limits.
          </div>
          {!activeScenarioId && (
            <button
              onClick={triggerIngestion}
              disabled={ingestionRunning}
              className="mt-4 px-5 py-2 text-sm font-medium bg-deevo-accent text-white rounded-xl hover:bg-blue-600 disabled:opacity-40 transition-colors"
            >
              {ingestionRunning ? "Ingesting..." : "Run Intelligence Pipeline"}
            </button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="exec-card rounded-2xl p-8 text-center">
          <div className="text-sm text-deevo-text-muted">No alerts match the selected filters.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert, idx) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              idx={idx}
              isAcknowledged={alertState.acknowledged.has(alert.thresholdId)}
              onAcknowledge={() => acknowledgeAlert(alert.thresholdId)}
              onMute={() => muteAlert(alert.thresholdId)}
            />
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          THRESHOLD RULES REFERENCE
          ════════════════════════════════════════════════════════ */}
      <div className="mt-12 pt-8 border-t border-deevo-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-deevo-text-primary tracking-tight">
            Configured Threshold Rules
          </h2>
          <span className="text-caption">{ALERT_THRESHOLDS.length} rules active</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ALERT_THRESHOLDS.map((t) => {
            const isMuted = alertState.muted.has(t.id);
            return (
              <div key={t.id} className={`exec-card rounded-xl p-3.5 ${isMuted ? "opacity-40" : ""}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-deevo-text-primary">{t.name}</span>
                  <span
                    className="text-label"
                    style={{ color: SEVERITY_COLORS[t.severity] || "#888" }}
                  >
                    {t.severity}
                  </span>
                </div>
                <div className="text-[10px] text-deevo-text-muted font-mono">
                  {t.field} {t.operator} {t.value}
                </div>
                <div className="text-[10px] text-deevo-text-muted mt-0.5 capitalize">
                  {t.category}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Alert Row ───────────────────────────────────────────────────

function AlertRow({
  alert,
  idx,
  isAcknowledged,
  onAcknowledge,
  onMute,
}: {
  alert: Alert;
  idx: number;
  isAcknowledged: boolean;
  onAcknowledge: () => void;
  onMute: () => void;
}) {
  const color = SEVERITY_COLORS[alert.severity] || "#888";
  const isCritical = alert.severity === "critical";
  const glowClass = SEVERITY_GLOW[alert.severity] || "";

  const breachPct = alert.thresholdValue > 0
    ? Math.min((alert.actualValue / alert.thresholdValue) * 100, 150)
    : 100;

  return (
    <div
      className={`exec-card rounded-xl p-4 ${glowClass} ${isCritical && !isAcknowledged ? "pulse-critical" : ""} ${isAcknowledged ? "opacity-60" : ""} fade-in-up`}
      style={{ animationDelay: `${idx * 40}ms` }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-label" style={{ color }}>
            {alert.severity}
          </span>
          <span className="text-[10px] text-deevo-text-muted px-1.5 py-0.5 bg-deevo-elevated rounded">
            {alert.category}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Acknowledge button */}
          {!isAcknowledged ? (
            <button
              onClick={onAcknowledge}
              className="text-[10px] px-2 py-0.5 text-deevo-text-muted hover:text-deevo-text-secondary border border-deevo-border rounded transition-colors"
            >
              Acknowledge
            </button>
          ) : (
            <span className="text-[10px] text-emerald-400/60">Acknowledged</span>
          )}
          {/* Mute button */}
          <button
            onClick={onMute}
            className="text-[10px] px-2 py-0.5 text-deevo-text-muted hover:text-red-400 border border-deevo-border rounded transition-colors"
          >
            Mute
          </button>
        </div>
      </div>

      {/* Alert name */}
      <div className="text-[13px] font-medium text-deevo-text-primary mb-1 leading-snug">
        {alert.name}
      </div>

      {/* Message */}
      <div className="text-[11px] text-deevo-text-secondary leading-relaxed mb-3">
        {alert.message}
      </div>

      {/* Threshold bar */}
      <div className="relative h-1.5 bg-deevo-elevated rounded-full overflow-hidden mb-2">
        <div
          className="absolute top-0 h-full w-[2px] bg-deevo-text-muted z-10"
          style={{ left: `${Math.min(100, (100 / breachPct) * 100)}%` }}
        />
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

      {/* Timestamp */}
      <div className="text-[9px] text-deevo-text-muted mt-2 font-mono">
        {new Date(alert.triggeredAt).toLocaleString()}
      </div>
    </div>
  );
}
