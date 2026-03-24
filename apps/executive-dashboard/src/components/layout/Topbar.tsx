"use client";

/**
 * Topbar — Displays current page context and active scenario status.
 *
 * Data-aware: shows active scenario ID, pipeline status,
 * and last ingestion timestamp from IntelligenceContext.
 */

import { usePathname } from "next/navigation";
import { NAVIGATION } from "@/config/navigation";
import { BRANDING } from "@/config/branding";
import { useIntelligence } from "@/lib/context/IntelligenceContext";

export function Topbar() {
  const pathname = usePathname();
  const { activeScenarioId, scenariosLoading, ingestionRunning } = useIntelligence();

  const currentNav = NAVIGATION.find(
    (n) => pathname === n.href || pathname?.startsWith(n.href + "/")
  );

  return (
    <header className="h-14 border-b border-deevo-border bg-deevo-surface/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
      {/* Left: Page context */}
      <div>
        {currentNav && (
          <>
            <span className="text-sm font-medium text-deevo-text-primary">
              {currentNav.label}
            </span>
            <span className="text-xs text-deevo-text-muted ml-3">
              {currentNav.description}
            </span>
          </>
        )}
      </div>

      {/* Right: Scenario + pipeline status */}
      <div className="flex items-center gap-4 text-xs text-deevo-text-muted">
        {ingestionRunning && (
          <span className="text-deevo-gold animate-pulse">Ingesting...</span>
        )}
        {activeScenarioId ? (
          <span className="font-mono text-deevo-text-secondary">
            {activeScenarioId.slice(0, 12)}...
          </span>
        ) : scenariosLoading ? (
          <span className="text-deevo-text-muted">Loading...</span>
        ) : (
          <span className="text-deevo-text-muted">No active scenario</span>
        )}
        <span className="text-deevo-gold">v{BRANDING.product.version}</span>
      </div>
    </header>
  );
}
