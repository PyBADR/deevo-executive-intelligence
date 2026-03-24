"use client";

/**
 * DemoGuide — First-time experience guidance overlay.
 *
 * Shows a sequence of highlight steps that explain what each
 * panel in the command center does. Non-blocking, dismissable,
 * with forward/back navigation.
 *
 * Steps:
 *   1. Score Banner — "This is your intelligence scoreboard"
 *   2. KPI Strip — "Top economic indicators that moved"
 *   3. Decision Queue — "Prioritized recommendations for action"
 *   4. Alert Monitor — "Threshold breaches requiring attention"
 *   5. Narrative Brief — "Your executive intelligence summary"
 *
 * Persistence: sessionStorage (SaaS: backend user preferences)
 */

import { useState, useEffect, useCallback } from "react";

interface GuideStep {
  title: string;
  description: string;
  detail: string;
  position: "top" | "center" | "bottom";
}

const GUIDE_STEPS: GuideStep[] = [
  {
    title: "Intelligence Scoreboard",
    description: "Your composite score, aggregate risk, active decisions, and pipeline confidence — all in one glance.",
    detail: "Scores update automatically when the pipeline processes new scenarios.",
    position: "top",
  },
  {
    title: "KPI Strip",
    description: "The top economic indicators that moved most. Large typography for instant pattern recognition.",
    detail: "Each KPI shows direction, magnitude, and the sector it belongs to.",
    position: "top",
  },
  {
    title: "Intelligence Feed",
    description: "Active scenarios flowing through the pipeline. Each card shows severity, category, and affected countries.",
    detail: "Click any scenario to load its full intelligence snapshot.",
    position: "center",
  },
  {
    title: "Decision Queue",
    description: "Prioritized executive recommendations with full reasoning chains — what, why, who, what next.",
    detail: "Decisions are ranked by urgency: immediate actions surface first.",
    position: "center",
  },
  {
    title: "Alert Monitor",
    description: "Threshold breaches across decision pressure, sector exposure, and risk scores.",
    detail: "Acknowledge or mute alerts. Critical alerts pulse with severity glow.",
    position: "center",
  },
  {
    title: "Executive Narrative",
    description: "A plain-language intelligence brief — written for ministers and board members, not analysts.",
    detail: "Covers assessment, key findings, economic impact, and recommended actions.",
    position: "bottom",
  },
];

const STORAGE_KEY = "deevo_guide_dismissed";

export function DemoGuide() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Only show for first-time visitors
    try {
      const dismissed = sessionStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        // Small delay so the command center renders first
        const t = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(t);
      }
    } catch {
      // sessionStorage not available
    }
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore
    }
  }, []);

  const next = useCallback(() => {
    if (step < GUIDE_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      dismiss();
    }
  }, [step, dismiss]);

  const prev = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  if (!visible) return null;

  const current = GUIDE_STEPS[step];
  const isLast = step === GUIDE_STEPS.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={dismiss}
      />

      {/* Guide Card */}
      <div
        className={`fixed z-50 left-1/2 -translate-x-1/2 max-w-md w-full mx-4 fade-in-up ${
          current.position === "top"
            ? "top-20"
            : current.position === "bottom"
            ? "bottom-20"
            : "top-1/2 -translate-y-1/2"
        }`}
      >
        <div className="bg-deevo-elevated border border-deevo-border rounded-2xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="text-label text-deevo-gold tracking-widest">GUIDE</div>
              <div className="text-[10px] text-deevo-text-muted font-mono">
                {step + 1} / {GUIDE_STEPS.length}
              </div>
            </div>
            <button
              onClick={dismiss}
              className="text-[11px] text-deevo-text-muted hover:text-deevo-text-secondary transition-colors"
            >
              Skip tour
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1 mb-5">
            {GUIDE_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === step
                    ? "bg-deevo-gold flex-[2]"
                    : i < step
                    ? "bg-deevo-gold/30 flex-1"
                    : "bg-deevo-border flex-1"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <h3 className="text-base font-semibold text-deevo-text-primary mb-2">
            {current.title}
          </h3>
          <p className="text-[13px] text-deevo-text-secondary leading-relaxed mb-2">
            {current.description}
          </p>
          <p className="text-[11px] text-deevo-text-muted leading-relaxed mb-5">
            {current.detail}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prev}
              disabled={step === 0}
              className="text-[12px] text-deevo-text-muted hover:text-deevo-text-secondary disabled:opacity-30 transition-colors"
            >
              Back
            </button>
            <button
              onClick={next}
              className="px-5 py-2 text-[12px] font-semibold rounded-lg bg-gradient-to-r from-deevo-gold/90 to-deevo-gold text-black hover:from-deevo-gold hover:to-deevo-gold/80 transition-all"
            >
              {isLast ? "Start Using" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
