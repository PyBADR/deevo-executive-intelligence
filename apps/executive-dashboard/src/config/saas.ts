/**
 * SaaS Configuration — Multi-tenant structure, pricing tiers, and access control.
 *
 * This is the structural foundation for productization.
 * No implementation of auth middleware yet — structure only.
 */

// ─── Pricing Tiers ──────────────────────────────────────────────

export interface PricingTier {
  id: string;
  name: string;
  nameAr: string;
  maxScenarios: number;
  maxUsers: number;
  features: string[];
  liveIngestion: boolean;
  simulationAccess: boolean;
  apiAccess: boolean;
  graphAccess: boolean;
  customAlerts: boolean;
  exportFormats: string[];
  supportLevel: "community" | "standard" | "priority" | "dedicated";
  priceUsdMonthly: number | null;  // null = custom pricing
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "sovereign",
    name: "Sovereign",
    nameAr: "سيادي",
    maxScenarios: 5,
    maxUsers: 3,
    features: [
      "12-stage intelligence pipeline",
      "5 preset scenarios",
      "Executive KPI dashboard",
      "Basic narratives",
    ],
    liveIngestion: false,
    simulationAccess: false,
    apiAccess: false,
    graphAccess: false,
    customAlerts: false,
    exportFormats: ["pdf"],
    supportLevel: "community",
    priceUsdMonthly: 2500,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    nameAr: "مؤسسي",
    maxScenarios: 50,
    maxUsers: 25,
    features: [
      "12-stage intelligence pipeline",
      "50 scenarios",
      "Live RSS ingestion",
      "6 simulation engines",
      "Risk register",
      "Scoring engine",
      "KPI dashboard (executive + country + sector)",
      "GCC dependency analysis",
      "Alert system",
    ],
    liveIngestion: true,
    simulationAccess: true,
    apiAccess: true,
    graphAccess: true,
    customAlerts: true,
    exportFormats: ["pdf", "xlsx", "json"],
    supportLevel: "priority",
    priceUsdMonthly: 12000,
  },
  {
    id: "government",
    name: "Government",
    nameAr: "حكومي",
    maxScenarios: -1,  // unlimited
    maxUsers: -1,
    features: [
      "Full intelligence platform",
      "Unlimited scenarios",
      "Custom simulation models",
      "Dedicated data feeds",
      "On-premise deployment option",
      "PDPL compliance package",
      "Arabic-first narratives",
      "Custom alert rules",
      "3D geospatial integration ready",
      "Dedicated success team",
    ],
    liveIngestion: true,
    simulationAccess: true,
    apiAccess: true,
    graphAccess: true,
    customAlerts: true,
    exportFormats: ["pdf", "xlsx", "json", "docx", "api"],
    supportLevel: "dedicated",
    priceUsdMonthly: null,
  },
];

// ─── Organization Model ─────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  nameAr: string;
  tierId: string;
  apiKey: string;
  createdAt: string;
  isActive: boolean;
  maxUsers: number;
  settings: OrganizationSettings;
}

export interface OrganizationSettings {
  defaultLanguage: "en" | "ar";
  timezone: string;
  customFeeds: string[];       // Additional RSS feed URLs
  alertOverrides: string[];    // Disabled alert IDs
  brandColor: string;          // Hex color for white-label
}

// ─── User Model ─────────────────────────────────────────────────

export interface OrganizationUser {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: "admin" | "analyst" | "viewer";
  permissions: UserPermission[];
  lastLogin: string | null;
}

export type UserPermission =
  | "view_dashboard"
  | "run_scenarios"
  | "run_simulations"
  | "run_ingestion"
  | "manage_alerts"
  | "export_data"
  | "manage_users"
  | "manage_settings"
  | "api_access";

export const ROLE_PERMISSIONS: Record<string, UserPermission[]> = {
  admin: [
    "view_dashboard", "run_scenarios", "run_simulations", "run_ingestion",
    "manage_alerts", "export_data", "manage_users", "manage_settings", "api_access",
  ],
  analyst: [
    "view_dashboard", "run_scenarios", "run_simulations", "run_ingestion",
    "manage_alerts", "export_data", "api_access",
  ],
  viewer: ["view_dashboard"],
};

// ─── API Key Model ──────────────────────────────────────────────

export interface ApiKeyConfig {
  key: string;
  organizationId: string;
  label: string;
  permissions: UserPermission[];
  rateLimit: number;           // requests per minute
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

export const TIER_RATE_LIMITS: Record<string, number> = {
  sovereign: 10,    // 10 req/min
  enterprise: 60,   // 60 req/min
  government: 300,  // 300 req/min
};
