/**
 * Navigation Configuration — Sidebar route definitions.
 *
 * Each entry maps to an app/ page and a specific pipeline layer.
 */

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  description: string;
  /** Which pipeline layers this view surfaces */
  pipelineLayers: string[];
}

export const NAVIGATION: NavItem[] = [
  {
    href: "/command-center",
    label: "Command Center",
    icon: "⬡",
    description: "Live intelligence overview with KPIs and alerts",
    pipelineLayers: ["Scoring", "KPI", "Risk", "Decision"],
  },
  {
    href: "/country",
    label: "Country Intelligence",
    icon: "◈",
    description: "GCC country-level macro sensitivity analysis",
    pipelineLayers: ["Country", "Macro", "GDP"],
  },
  {
    href: "/sector",
    label: "Sector Exposure",
    icon: "◇",
    description: "20-sector, 4-tier sovereign-grade exposure model",
    pipelineLayers: ["Sector"],
  },
  {
    href: "/decisions",
    label: "Decisions",
    icon: "▸",
    description: "Prioritized recommendations with reasoning chains",
    pipelineLayers: ["Decision", "Explanation"],
  },
  {
    href: "/narrative",
    label: "Executive Brief",
    icon: "≡",
    description: "Government-grade intelligence narrative",
    pipelineLayers: ["Narrative"],
  },
  {
    href: "/alerts",
    label: "Alerts",
    icon: "!",
    description: "Threshold-based intelligence triggers",
    pipelineLayers: ["Scoring", "Risk", "KPI"],
  },
  {
    href: "/executive",
    label: "Executive Mode",
    icon: "◉",
    description: "Minimal narrative-focused intelligence view",
    pipelineLayers: ["Narrative", "Decision", "Scoring"],
  },
  {
    href: "/pricing",
    label: "Pricing",
    icon: "$",
    description: "SaaS editions and packaging",
    pipelineLayers: [],
  },
];
