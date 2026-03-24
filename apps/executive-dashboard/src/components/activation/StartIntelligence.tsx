"use client";

/**
 * StartIntelligence — Cinematic activation surface.
 *
 * When clicked:
 *   1. Auto-configures GCC region, sectors, timeframe
 *   2. Triggers pipeline with cinematic phase messaging
 *   3. Shows staged pipeline indicators lighting up sequentially
 *   4. Smooth transitions between phases
 *   5. Falls back to seeded demo scenario if no real data
 *
 * Cinematic messaging for each phase creates the perception of a
 * high-end intelligence system processing in real time.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getActivationEngine,
  ActivationState,
  ActivationPhase,
} from "@/lib/activation/activation-engine";
import { useIntelligence } from "@/lib/context/IntelligenceContext";

// ─── Cinematic Phase Config ───────────────────────────────────────

interface PhaseConfig {
  label: string;
  message: string;
  detail: string;
}

const PHASE_CONFIG: Record<ActivationPhase, PhaseConfig> = {
  idle: {
    label: "Start Intelligence",
    message: "Ready to activate sovereign-grade intelligence",
    detail: "12-stage pipeline · 6 countries · 20 sectors",
  },
  configuring: {
    label: "Configuring",
    message: "Initializing GCC intelligence parameters",
    detail: "Region: GCC · Timeframe: Real-time · Mode: Full cascade",
  },
  ingesting: {
    label: "Ingesting",
    message: "Acquiring scenario data and macro indicators",
    detail: "Sources validated · Cross-referencing global feeds",
  },
  processing: {
    label: "Processing",
    message: "Computing cascading impacts across GCC economies",
    detail: "Country sensitivity · Sector exposure · GDP decomposition",
  },
  scoring: {
    label: "Scoring",
    message: "Generating risk assessments and confidence scores",
    detail: "Aggregate risk · Threshold evaluation · Severity classification",
  },
  generating: {
    label: "Generating",
    message: "Composing executive intelligence brief",
    detail: "Decision recommendations · Narrative synthesis · Alert dispatch",
  },
  complete: {
    label: "Intelligence Ready",
    message: "Pipeline complete — full intelligence available",
    detail: "All 12 stages verified · Entering command center",
  },
  error: {
    label: "Retry",
    message: "Pipeline interrupted",
    detail: "Click to retry activation",
  },
};

const PIPELINE_STAGES = [
  { key: "scenario", label: "Scenario", phase: "configuring", num: 1 },
  { key: "macro", label: "Macro", phase: "ingesting", num: 2 },
  { key: "gdp", label: "GDP", phase: "ingesting", num: 3 },
  { key: "country", label: "Country", phase: "processing", num: 4 },
  { key: "sector", label: "Sector", phase: "processing", num: 5 },
  { key: "decision", label: "Decision", phase: "processing", num: 6 },
  { key: "explanation", label: "Explain", phase: "scoring", num: 7 },
  { key: "graph", label: "Graph", phase: "scoring", num: 8 },
  { key: "scoring", label: "Scoring", phase: "scoring", num: 9 },
  { key: "risk", label: "Risk", phase: "scoring", num: 10 },
  { key: "kpi", label: "KPI", phase: "generating", num: 11 },
  { key: "narrative", label: "Narrative", phase: "generating", num: 12 },
];

const PHASE_ORDER: ActivationPhase[] = [
  "idle", "configuring", "ingesting", "processing", "scoring", "generating", "complete",
];

function isStageComplete(stagePhase: string, currentPhase: ActivationPhase): boolean {
  const currentIdx = PHASE_ORDER.indexOf(currentPhase);
  const stageIdx = PHASE_ORDER.indexOf(stagePhase as ActivationPhase);
  return stageIdx < currentIdx;
}

function isStageActive(stagePhase: string, currentPhase: ActivationPhase): boolean {
  const currentIdx = PHASE_ORDER.indexOf(currentPhase);
  const stageIdx = PHASE_ORDER.indexOf(stagePhase as ActivationPhase);
  return stageIdx === currentIdx && currentPhase !== "idle";
}

// ─── Component ───────────────────────────────────────────────────

export function StartIntelligence() {
  const router = useRouter();
  const { refresh } = useIntelligence();
  const [state, setState] = useState<ActivationState>({
    phase: "idle",
    progress: 0,
    message: "Ready to activate",
    scenarioId: null,
    error: null,
    startedAt: null,
    completedAt: null,
  });
  const engineRef = useRef(getActivationEngine());
  const hasRedirected = useRef(false);

  useEffect(() => {
    const engine = engineRef.current;
    const unsub = engine.onStateChange(setState);
    return unsub;
  }, []);

  useEffect(() => {
    if (state.phase === "complete" && !hasRedirected.current) {
      hasRedirected.current = true;
      refresh();
      const t = setTimeout(() => router.push("/command-center"), 1500);
      return () => clearTimeout(t);
    }
  }, [state.phase, refresh, router]);

  const handleActivate = useCallback(async () => {
    if (state.phase !== "idle" && state.phase !== "error" && state.phase !== "complete") return;
    hasRedirected.current = false;
    engineRef.current.reset();
    await engineRef.current.activate();
  }, [state.phase]);

  const isRunning =
    state.phase !== "idle" && state.phase !== "complete" && state.phase !== "error";
  const isComplete = state.phase === "complete";
  const config = PHASE_CONFIG[state.phase];
  const elapsed =
    state.startedAt && state.completedAt
      ? ((state.completedAt - state.startedAt) / 1000).toFixed(1)
      : null;

  return (
    <div className="w-full">
      {/* ── Activation Button ── */}
      <button
        onClick={handleActivate}
        disabled={isRunning}
        className={`w-full relative overflow-hidden rounded-2xl transition-all duration-500 ${
          isRunning
            ? "bg-deevo-surface border border-deevo-border py-7 cursor-wait"
            : isComplete
            ? "bg-emerald-500/8 border border-emerald-500/25 py-7 hover:bg-emerald-500/12"
            : state.phase === "error"
            ? "bg-red-500/8 border border-red-500/25 py-7 hover:bg-red-500/12 cursor-pointer"
            : "bg-gradient-to-r from-deevo-gold/90 to-deevo-gold py-7 hover:from-deevo-gold hover:to-deevo-gold/80 shadow-[0_0_40px_rgba(212,168,83,0.2)] hover:shadow-[0_0_60px_rgba(212,168,83,0.3)] cursor-pointer"
        }`}
      >
        {/* Progress bar overlay */}
        {isRunning && (
          <div
            className="absolute inset-y-0 left-0 bg-deevo-accent/6 transition-all duration-700 ease-out"
            style={{ width: `${state.progress}%` }}
          />
        )}

        {/* Scanning line effect */}
        {isRunning && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="scan-line" />
          </div>
        )}

        <div className="relative z-10 px-6">
          {/* Phase label */}
          <div
            className={`text-sm font-bold tracking-tight transition-colors duration-300 ${
              isRunning
                ? "text-deevo-accent"
                : isComplete
                ? "text-emerald-400"
                : state.phase === "error"
                ? "text-red-400"
                : "text-black"
            }`}
          >
            {config.label}
          </div>

          {/* Phase message */}
          <div
            className={`text-[12px] mt-1.5 transition-colors duration-300 ${
              isRunning
                ? "text-deevo-text-secondary"
                : isComplete
                ? "text-emerald-400/60"
                : state.phase === "error"
                ? "text-red-400/60"
                : "text-black/60"
            }`}
          >
            {isComplete && elapsed
              ? `Completed in ${elapsed}s — entering command center`
              : config.message}
          </div>

          {/* Phase detail line */}
          {(isRunning || state.phase === "idle") && (
            <div
              className={`text-[10px] mt-1 font-mono transition-colors duration-300 ${
                isRunning ? "text-deevo-text-muted" : "text-black/40"
              }`}
            >
              {config.detail}
            </div>
          )}
        </div>
      </button>

      {/* ── Pipeline Stage Indicators ── */}
      {(isRunning || isComplete) && (
        <div className="mt-5 grid grid-cols-6 gap-1.5 fade-in-up">
          {PIPELINE_STAGES.map((stage) => {
            const complete = isStageComplete(stage.phase, state.phase);
            const active = isStageActive(stage.phase, state.phase);
            return (
              <div
                key={stage.key}
                className={`px-1.5 py-2 rounded-lg text-center transition-all duration-500 ${
                  complete
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : active
                    ? "bg-deevo-accent/8 border border-deevo-accent/20"
                    : "bg-deevo-elevated border border-deevo-border-subtle"
                }`}
              >
                <div
                  className={`text-[9px] font-mono mb-0.5 transition-colors duration-500 ${
                    complete ? "text-emerald-400" : active ? "text-deevo-accent" : "text-deevo-text-muted"
                  }`}
                >
                  {stage.num}
                </div>
                <div
                  className={`text-[9px] font-medium transition-colors duration-500 ${
                    complete
                      ? "text-emerald-400"
                      : active
                      ? "text-deevo-accent"
                      : "text-deevo-text-muted"
                  }`}
                >
                  {stage.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Completion Briefing ── */}
      {isComplete && (
        <div className="mt-6 space-y-3 fade-in-up">
          <div className="exec-card rounded-xl p-5">
            <div className="briefing-section">
              <div className="section-header-gold mb-1">What Is Happening</div>
              <div className="text-[12px] text-deevo-text-secondary leading-relaxed">
                The intelligence pipeline has processed a global economic scenario and computed
                its cascading impact across 6 GCC countries and 20 industry sectors.
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="exec-card rounded-xl p-4">
              <div className="briefing-section">
                <div className="section-header-gold mb-1">Why It Matters</div>
                <div className="text-[11px] text-deevo-text-secondary leading-relaxed">
                  Decision-makers need traceable, deterministic analysis — not forecasts or speculation.
                </div>
              </div>
            </div>
            <div className="exec-card rounded-xl p-4">
              <div className="briefing-section">
                <div className="section-header-gold mb-1">What To Do</div>
                <div className="text-[11px] text-deevo-text-secondary leading-relaxed">
                  Review the command center for decisions, alerts, and the executive narrative.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
