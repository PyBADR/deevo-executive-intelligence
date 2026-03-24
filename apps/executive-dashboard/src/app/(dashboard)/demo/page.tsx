"use client";

/**
 * Demo Mode — Activation Surface
 *
 * Behavior:
 *   1. If snapshot already exists → redirect to command center immediately
 *   2. Otherwise → show StartIntelligence activation component
 *   3. StartIntelligence handles: auto-config, pipeline, demo fallback, redirect
 *
 * This is the "View Live Scenario" CTA destination from the landing page.
 */

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useIntelligence } from "@/lib/context/IntelligenceContext";
import { StartIntelligence } from "@/components/activation/StartIntelligence";

export default function DemoPage() {
  const router = useRouter();
  const { activeScenarioId, snapshot } = useIntelligence();
  const hasRedirected = useRef(false);

  // If data already exists, go straight to command center
  useEffect(() => {
    if (snapshot && activeScenarioId && !hasRedirected.current) {
      hasRedirected.current = true;
      const t = setTimeout(() => router.push("/command-center"), 600);
      return () => clearTimeout(t);
    }
  }, [snapshot, activeScenarioId, router]);

  // If already have data, show transition screen
  if (snapshot && activeScenarioId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center fade-in-up">
          <div className="text-emerald-400 text-sm font-medium mb-2">
            Intelligence Ready
          </div>
          <div className="text-[11px] text-deevo-text-muted">
            Entering command center...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-lg w-full text-center fade-in-up">
        {/* Classification bar */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-deevo-gold to-transparent mb-10" />

        <div className="text-label text-deevo-gold tracking-widest mb-4">
          DEEVO EXECUTIVE INTELLIGENCE
        </div>

        <h1 className="text-xl font-semibold text-deevo-text-primary mb-2 tracking-tight">
          Activate Intelligence Pipeline
        </h1>
        <p className="text-[13px] text-deevo-text-secondary mb-8">
          One click to run the full 12-stage deterministic engine across 6 GCC
          countries, 20 sectors, and 5 GDP components.
        </p>

        {/* Activation surface */}
        <div className="max-w-sm mx-auto">
          <StartIntelligence />
        </div>

        {/* Manual skip */}
        <div className="mt-8">
          <button
            onClick={() => router.push("/command-center")}
            className="text-[11px] text-deevo-text-muted hover:text-deevo-text-secondary transition-colors underline underline-offset-2"
          >
            Skip to dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}
