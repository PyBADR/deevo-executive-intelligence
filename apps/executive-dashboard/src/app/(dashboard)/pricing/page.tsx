"use client";

/**
 * SaaS Pricing — Product Editions & Packaging
 *
 * This page serves dual purpose:
 *   1. Internal reference for the product team on tier structure
 *   2. Client-facing pricing page when deployed to marketing site
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │  Header — product name + tagline                             │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Tier Cards (3-column) — Sovereign / Enterprise / Government │
 *   │    Each shows: price, features, limits, support level        │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Feature Comparison Matrix                                   │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Target Buyer Mapping                                        │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  Platform Identity + Footer                                  │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * Data: PRICING_TIERS from @/config/saas + BRANDING
 */

import { PRICING_TIERS, PricingTier, TIER_RATE_LIMITS } from "@/config/saas";
import { BRANDING } from "@/config/branding";

// ─── Tier Styling ────────────────────────────────────────────────

const TIER_STYLE: Record<string, { accent: string; border: string; badge: string; glow: string }> = {
  sovereign:  { accent: "text-blue-400",   border: "border-blue-500/20",  badge: "bg-blue-500/10 text-blue-400",  glow: "" },
  enterprise: { accent: "text-deevo-gold", border: "border-deevo-gold/30", badge: "bg-deevo-gold/10 text-deevo-gold", glow: "exec-card-glow" },
  government: { accent: "text-emerald-400", border: "border-emerald-500/20", badge: "bg-emerald-500/10 text-emerald-400", glow: "" },
};

const TARGET_BUYERS: Record<string, string[]> = {
  sovereign: [
    "Regional insurance companies",
    "Family offices",
    "Mid-size asset managers",
    "Corporate treasury departments",
    "Economic advisory firms",
  ],
  enterprise: [
    "Sovereign wealth funds",
    "Central bank research divisions",
    "Large insurance groups",
    "Investment banks (GCC desk)",
    "Rating agencies (regional)",
    "Pension fund managers",
  ],
  government: [
    "Ministry of Finance",
    "Ministry of Economy",
    "Central banks",
    "Vision 2030 program offices",
    "National development funds",
    "Regulatory authorities",
  ],
};

// ─── Feature comparison rows ────────────────────────────────────

interface FeatureRow {
  name: string;
  sovereign: string;
  enterprise: string;
  government: string;
}

const FEATURES: FeatureRow[] = [
  { name: "Intelligence Pipeline",    sovereign: "12 stages",     enterprise: "12 stages",     government: "12 stages + custom" },
  { name: "Scenarios",                sovereign: "5 preset",      enterprise: "50",             government: "Unlimited" },
  { name: "Users",                    sovereign: "3",             enterprise: "25",             government: "Unlimited" },
  { name: "Live Ingestion",           sovereign: "—",             enterprise: "RSS + API",      government: "Custom feeds" },
  { name: "Simulation Engines",       sovereign: "—",             enterprise: "6 engines",      government: "Custom models" },
  { name: "Risk Register",            sovereign: "View only",     enterprise: "Full access",    government: "Full + custom rules" },
  { name: "Alert System",             sovereign: "Default rules",  enterprise: "Custom rules",   government: "Custom + escalation" },
  { name: "GCC Countries",            sovereign: "6",             enterprise: "6",              government: "6 + custom regions" },
  { name: "Sector Coverage",          sovereign: "20 sectors",    enterprise: "20 sectors",     government: "20 + custom" },
  { name: "API Access",               sovereign: "—",             enterprise: "60 req/min",     government: "300 req/min" },
  { name: "Export Formats",           sovereign: "PDF",           enterprise: "PDF, XLSX, JSON", government: "All + API" },
  { name: "Bilingual (EN/AR)",        sovereign: "English only",  enterprise: "Full bilingual",  government: "Arabic-first" },
  { name: "Deployment",               sovereign: "Cloud",         enterprise: "Cloud",           government: "Cloud + On-premise" },
  { name: "PDPL Compliance",          sovereign: "Standard",      enterprise: "Full",            government: "Full + audit pack" },
  { name: "Support",                  sovereign: "Community",     enterprise: "Priority",        government: "Dedicated team" },
];

// ─── Page ────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto">

      {/* ════════════════════════════════════════════════════════
          HEADER
          ════════════════════════════════════════════════════════ */}
      <div className="text-center mb-12 fade-in-up">
        <div className="text-label text-deevo-gold tracking-widest mb-3">
          {BRANDING.product.company.toUpperCase()}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-deevo-text-primary mb-3">
          Sovereign-Grade Intelligence for Every Scale
        </h1>
        <p className="text-[14px] text-deevo-text-secondary max-w-xl mx-auto leading-relaxed">
          From insurance companies to central banks — the same deterministic 12-stage pipeline,
          scaled to match your organization's decision scope.
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════
          PRICING TIERS
          ════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {PRICING_TIERS.map((tier, idx) => (
          <TierCard key={tier.id} tier={tier} idx={idx} />
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════
          FEATURE COMPARISON
          ════════════════════════════════════════════════════════ */}
      <div className="mb-16 fade-in-up" style={{ animationDelay: "200ms" }}>
        <h2 className="text-lg font-semibold text-deevo-text-primary tracking-tight mb-6 text-center">
          Feature Comparison
        </h2>
        <div className="exec-card rounded-2xl overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-deevo-elevated/60 border-b border-deevo-border-subtle">
                <th className="text-left px-5 py-3 text-deevo-text-muted font-medium">Feature</th>
                <th className="text-center px-4 py-3 text-blue-400 font-medium">Sovereign</th>
                <th className="text-center px-4 py-3 text-deevo-gold font-medium">Enterprise</th>
                <th className="text-center px-4 py-3 text-emerald-400 font-medium">Government</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((row, i) => (
                <tr key={row.name} className={`border-b border-deevo-border-subtle/50 ${i % 2 === 0 ? "" : "bg-deevo-elevated/20"}`}>
                  <td className="px-5 py-2.5 text-deevo-text-secondary font-medium">{row.name}</td>
                  <td className="text-center px-4 py-2.5 text-deevo-text-muted">{row.sovereign}</td>
                  <td className="text-center px-4 py-2.5 text-deevo-text-secondary">{row.enterprise}</td>
                  <td className="text-center px-4 py-2.5 text-deevo-text-secondary">{row.government}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          TARGET BUYER MAPPING
          ════════════════════════════════════════════════════════ */}
      <div className="mb-16 fade-in-up" style={{ animationDelay: "300ms" }}>
        <h2 className="text-lg font-semibold text-deevo-text-primary tracking-tight mb-6 text-center">
          Who Uses Each Edition
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(["sovereign", "enterprise", "government"] as const).map((tierId) => {
            const style = TIER_STYLE[tierId];
            const buyers = TARGET_BUYERS[tierId];
            const tier = PRICING_TIERS.find((t) => t.id === tierId);
            return (
              <div key={tierId} className="exec-card rounded-xl p-5">
                <div className={`text-sm font-semibold mb-3 ${style.accent}`}>
                  {tier?.name}
                </div>
                <div className="space-y-2">
                  {buyers.map((buyer) => (
                    <div key={buyer} className="flex items-start gap-2">
                      <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${style.accent.replace("text-", "bg-")}`} />
                      <span className="text-[12px] text-deevo-text-secondary">{buyer}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          PLATFORM IDENTITY
          ════════════════════════════════════════════════════════ */}
      <div className="text-center pt-8 border-t border-deevo-border fade-in-up" style={{ animationDelay: "400ms" }}>
        <div className="text-[11px] text-deevo-text-muted space-y-1">
          <p>
            {BRANDING.product.name} · Built by {BRANDING.creator.name}
          </p>
          <p>
            12-stage deterministic pipeline · {BRANDING.pipeline.sectors} sectors ·{" "}
            {BRANDING.pipeline.countries} GCC countries · Zero hallucination
          </p>
          <p className="font-mono text-[10px]">
            Contact: sales@deevo.ai · GitHub: {BRANDING.creator.github.username}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Tier Card ───────────────────────────────────────────────────

function TierCard({ tier, idx }: { tier: PricingTier; idx: number }) {
  const style = TIER_STYLE[tier.id] || TIER_STYLE.sovereign;
  const isEnterprise = tier.id === "enterprise";
  const rateLimit = TIER_RATE_LIMITS[tier.id] || 0;

  return (
    <div
      className={`${isEnterprise ? "exec-card-glow" : "exec-card"} rounded-2xl overflow-hidden border ${style.border} fade-in-up relative`}
      style={{ animationDelay: `${idx * 80}ms` }}
    >
      {/* Popular badge */}
      {isEnterprise && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-deevo-gold text-black text-[10px] font-bold rounded-bl-xl">
          MOST POPULAR
        </div>
      )}

      <div className="p-6">
        {/* Tier name */}
        <div className={`text-label ${style.accent} mb-2`}>{tier.id.toUpperCase()}</div>
        <h3 className="text-xl font-semibold text-deevo-text-primary mb-1">{tier.name}</h3>
        <div className="text-[11px] text-deevo-text-muted mb-5">{tier.nameAr}</div>

        {/* Price */}
        <div className="mb-6">
          {tier.priceUsdMonthly ? (
            <div className="flex items-baseline gap-1">
              <span className={`text-display ${style.accent}`}>
                ${tier.priceUsdMonthly.toLocaleString()}
              </span>
              <span className="text-[12px] text-deevo-text-muted">/month</span>
            </div>
          ) : (
            <div className={`text-headline ${style.accent}`}>Custom Pricing</div>
          )}
        </div>

        {/* Limits */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="exec-card rounded-lg p-2.5 text-center">
            <div className="text-sm font-semibold text-deevo-text-primary">
              {tier.maxScenarios === -1 ? "∞" : tier.maxScenarios}
            </div>
            <div className="text-[10px] text-deevo-text-muted">Scenarios</div>
          </div>
          <div className="exec-card rounded-lg p-2.5 text-center">
            <div className="text-sm font-semibold text-deevo-text-primary">
              {tier.maxUsers === -1 ? "∞" : tier.maxUsers}
            </div>
            <div className="text-[10px] text-deevo-text-muted">Users</div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {tier.features.map((feature) => (
            <div key={feature} className="flex items-start gap-2">
              <span className={`flex-shrink-0 w-1 h-1 rounded-full mt-1.5 ${style.accent.replace("text-", "bg-")}`} />
              <span className="text-[12px] text-deevo-text-secondary">{feature}</span>
            </div>
          ))}
        </div>

        {/* Capability badges */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {tier.liveIngestion && (
            <span className="text-[10px] px-2 py-0.5 bg-deevo-elevated text-deevo-text-secondary rounded">Live Ingestion</span>
          )}
          {tier.simulationAccess && (
            <span className="text-[10px] px-2 py-0.5 bg-deevo-elevated text-deevo-text-secondary rounded">Simulations</span>
          )}
          {tier.apiAccess && (
            <span className="text-[10px] px-2 py-0.5 bg-deevo-elevated text-deevo-text-secondary rounded">API ({rateLimit}/min)</span>
          )}
          {tier.graphAccess && (
            <span className="text-[10px] px-2 py-0.5 bg-deevo-elevated text-deevo-text-secondary rounded">Graph Analysis</span>
          )}
          {tier.customAlerts && (
            <span className="text-[10px] px-2 py-0.5 bg-deevo-elevated text-deevo-text-secondary rounded">Custom Alerts</span>
          )}
        </div>

        {/* Support + Export */}
        <div className="pt-4 border-t border-deevo-border-subtle text-[11px] text-deevo-text-muted">
          <div className="flex justify-between mb-1">
            <span>Support</span>
            <span className="capitalize text-deevo-text-secondary">{tier.supportLevel}</span>
          </div>
          <div className="flex justify-between">
            <span>Export</span>
            <span className="text-deevo-text-secondary">{tier.exportFormats.join(", ").toUpperCase()}</span>
          </div>
        </div>

        {/* CTA */}
        <button className={`w-full mt-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isEnterprise
            ? "bg-deevo-gold text-black hover:bg-deevo-gold/90"
            : `border ${style.border} ${style.accent} hover:bg-deevo-elevated`
        }`}>
          {tier.priceUsdMonthly ? "Get Started" : "Contact Sales"}
        </button>
      </div>
    </div>
  );
}
