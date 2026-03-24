/**
 * Branding Configuration — Deevo Analytics Identity.
 *
 * Central source of truth for all product identity surfaces:
 * metadata, footer, sidebar, about screens.
 */

export const BRANDING = {
  // ── Product ──────────────────────────────────────────────────
  product: {
    name: "Deevo Executive Intelligence",
    shortName: "DEEVO",
    tagline: "Sovereign-Grade GCC Economic Intelligence",
    company: "Deevo Analytics",
    version: "1.0.0",
    description:
      "AI Decision Intelligence Platform for GCC Insurance & Economic Risk — 12-stage deterministic pipeline, 20 sectors, 6 countries.",
  },

  // ── Creator ──────────────────────────────────────────────────
  creator: {
    name: "Bader Alabddan",
    title: "Founder & Architect",
    github: {
      profile: "https://github.com/PyBADR",
      username: "PyBADR",
    },
    discord: {
      username: "Baderalabddan",
    },
  },

  // ── Links ────────────────────────────────────────────────────
  links: {
    github: "https://github.com/PyBADR",
    repository: "https://github.com/PyBADR/deevo-executive-intelligence",
    discord: "https://discord.com",
  },

  // ── Pipeline Identity ────────────────────────────────────────
  pipeline: {
    stages: 12,
    sectors: 20,
    countries: 6,
    tiers: 4,
    stageNames: [
      "Scenario",
      "Macro",
      "GDP",
      "Country",
      "Sector",
      "Decision",
      "Explanation",
      "Graph",
      "Scoring",
      "Risk",
      "KPI",
      "Narrative",
    ],
  },

  // ── Metadata ─────────────────────────────────────────────────
  metadata: {
    title: "Deevo Executive Intelligence",
    description:
      "GCC Economic Intelligence — Sovereign-Grade Decision Platform by Deevo Analytics",
    keywords: [
      "GCC",
      "economic intelligence",
      "decision intelligence",
      "insurance",
      "sovereign risk",
      "AI analytics",
      "Deevo Analytics",
    ],
    author: "Bader Alabddan",
    generator: "Deevo Analytics Intelligence Pipeline v1.0",
  },

  // ── Footer Text ──────────────────────────────────────────────
  footer: {
    builtBy: "Built by Bader Alabddan",
    poweredBy: "Deevo Analytics",
    copyright: `© ${new Date().getFullYear()} Deevo Analytics. All rights reserved.`,
    pipelineNote:
      "12-stage deterministic intelligence pipeline — no AI hallucination, no fabricated data.",
  },
} as const;
