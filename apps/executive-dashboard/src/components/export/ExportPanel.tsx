"use client";

/**
 * ExportPanel — Share & export intelligence outputs.
 *
 * Available in command center and executive mode.
 * Options: Export narrative, export decisions, full report, copy link.
 */

import { useState, useCallback } from "react";
import { useIntelligence } from "@/lib/context/IntelligenceContext";
import {
  exportNarrative,
  exportDecisions,
  exportFullBrief,
  copyToClipboard,
  downloadFile,
  generateShareLink,
} from "@/lib/export/export-engine";

type ExportAction = "narrative" | "decisions" | "full" | "link";

export function ExportPanel() {
  const { snapshot, activeScenarioId } = useIntelligence();
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = useCallback((msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  }, []);

  const handleExport = useCallback(
    async (action: ExportAction) => {
      if (!snapshot) return;

      switch (action) {
        case "narrative": {
          const result = exportNarrative(snapshot);
          downloadFile(result);
          showFeedback("Narrative exported");
          break;
        }
        case "decisions": {
          const result = exportDecisions(snapshot);
          downloadFile(result);
          showFeedback("Decisions exported");
          break;
        }
        case "full": {
          const result = exportFullBrief(snapshot);
          downloadFile(result);
          showFeedback("Full report exported");
          break;
        }
        case "link": {
          if (activeScenarioId) {
            const link = generateShareLink(activeScenarioId);
            const ok = await copyToClipboard(link);
            showFeedback(ok ? "Link copied to clipboard" : "Failed to copy");
          }
          break;
        }
      }
      setOpen(false);
    },
    [snapshot, activeScenarioId, showFeedback]
  );

  if (!snapshot) return null;

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-deevo-text-secondary hover:text-deevo-text-primary bg-deevo-surface border border-deevo-border-subtle rounded-lg hover:border-deevo-border transition-all"
      >
        <span className="text-[13px]">↗</span>
        Share
      </button>

      {/* Feedback toast */}
      {feedback && (
        <div className="absolute right-0 top-10 z-50 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] text-emerald-400 whitespace-nowrap fade-in-up">
          {feedback}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-56 bg-deevo-elevated border border-deevo-border rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.4)] overflow-hidden fade-in-up">
            <div className="p-2">
              <div className="text-[10px] text-deevo-text-muted px-3 py-1.5 tracking-widest uppercase">
                Export
              </div>
              <ExportItem
                label="Executive Narrative"
                detail="Markdown brief"
                onClick={() => handleExport("narrative")}
              />
              <ExportItem
                label="Decision Report"
                detail="All decisions with reasoning"
                onClick={() => handleExport("decisions")}
              />
              <ExportItem
                label="Full Intelligence Report"
                detail="Complete brief + decisions + countries"
                onClick={() => handleExport("full")}
              />
              <div className="h-px bg-deevo-border-subtle my-1" />
              <div className="text-[10px] text-deevo-text-muted px-3 py-1.5 tracking-widest uppercase">
                Share
              </div>
              <ExportItem
                label="Copy Scenario Link"
                detail="Deep link to this intelligence view"
                onClick={() => handleExport("link")}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ExportItem({
  label,
  detail,
  onClick,
}: {
  label: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-lg hover:bg-deevo-surface transition-colors group"
    >
      <div className="text-[12px] font-medium text-deevo-text-primary group-hover:text-deevo-gold transition-colors">
        {label}
      </div>
      <div className="text-[10px] text-deevo-text-muted">{detail}</div>
    </button>
  );
}
