"use client";

/**
 * Footer — Product identity surface.
 *
 * Must include:
 * - Deevo Intelligence Platform
 * - Built by Bader Alabddan
 * - GitHub: https://github.com/PyBADR
 * - Discord: Baderalabddan
 */

import { BRANDING } from "@/config/branding";

export function Footer() {
  return (
    <footer className="border-t border-deevo-border bg-deevo-surface/30 px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs text-deevo-text-muted">
        {/* Left: Product + Creator */}
        <div className="flex items-center gap-3">
          <span className="text-deevo-gold font-medium">
            {BRANDING.product.name}
          </span>
          <span className="text-deevo-border">|</span>
          <span>{BRANDING.footer.builtBy}</span>
        </div>

        {/* Center: Pipeline note (hidden on small screens) */}
        <div className="hidden lg:block text-center">
          {BRANDING.footer.pipelineNote}
        </div>

        {/* Right: Links + Copyright */}
        <div className="flex items-center gap-3">
          <a
            href={BRANDING.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-deevo-text-secondary transition-colors"
          >
            GitHub: {BRANDING.creator.github.username}
          </a>
          <span className="text-deevo-border">|</span>
          <span>Discord: {BRANDING.creator.discord.username}</span>
          <span className="text-deevo-border">|</span>
          <span>{BRANDING.footer.copyright}</span>
        </div>
      </div>
    </footer>
  );
}
