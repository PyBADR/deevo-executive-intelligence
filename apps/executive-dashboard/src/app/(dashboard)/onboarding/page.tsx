"use client";

/**
 * Onboarding Flow — Select Country → Sectors → Activate Intelligence
 *
 * Step 1: Select primary GCC country (or all)
 * Step 2: Select sectors of interest
 * Step 3: Activate → triggers pipeline → redirects to command center
 *
 * This is a guided entry point. The selections don't filter the pipeline
 * (it always runs all 6 countries, all 20 sectors), but they set the
 * user's preference context for future personalization (SaaS tier feature).
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useIntelligence } from "@/lib/context/IntelligenceContext";

// ─── Data ────────────────────────────────────────────────────────

const COUNTRIES = [
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭" },
  { code: "OM", name: "Oman", flag: "🇴🇲" },
];

const SECTOR_GROUPS = [
  {
    tier: 1,
    name: "Critical Sovereign",
    sectors: ["oil_gas", "defense", "healthcare", "utilities", "government_services"],
  },
  {
    tier: 2,
    name: "Financial & Economic",
    sectors: ["banking", "insurance", "real_estate", "capital_markets", "islamic_finance"],
  },
  {
    tier: 3,
    name: "Market & Growth",
    sectors: ["retail", "logistics", "tourism", "food_agriculture", "manufacturing"],
  },
  {
    tier: 4,
    name: "Future & Strategic",
    sectors: ["technology", "education", "media", "professional_services", "telecommunications"],
  },
];

type Step = 1 | 2 | 3;

// ─── Page ────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { triggerIngestion, ingestionRunning, activeScenarioId } = useIntelligence();

  const [step, setStep] = useState<Step>(1);
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(new Set());
  const [activating, setActivating] = useState(false);

  const toggleSector = useCallback((code: string) => {
    setSelectedSectors((prev) => {
      const next = new Set(Array.from(prev));
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  const selectAllSectors = useCallback(() => {
    const all = SECTOR_GROUPS.flatMap((g) => g.sectors);
    setSelectedSectors(new Set(all));
  }, []);

  const handleActivate = useCallback(async () => {
    setActivating(true);
    try {
      // Store preferences (local — SaaS tier would persist to backend)
      if (typeof window !== "undefined") {
        const prefs = {
          country: selectedCountry,
          sectors: Array.from(selectedSectors),
          activatedAt: new Date().toISOString(),
        };
        try { window.sessionStorage.setItem("deevo_prefs", JSON.stringify(prefs)); } catch {}
      }

      // Trigger pipeline if no active scenario
      if (!activeScenarioId) {
        await triggerIngestion();
      }

      // Redirect to demo (which handles the loading → command center flow)
      router.push("/demo");
    } catch {
      router.push("/command-center");
    }
  }, [selectedCountry, selectedSectors, activeScenarioId, triggerIngestion, router]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-xl w-full fade-in-up">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-deevo-accent" : "bg-deevo-elevated"
                }`}
              />
              {s < 3 && <span className="text-[10px] text-deevo-text-muted">→</span>}
            </div>
          ))}
        </div>

        {/* Step 1: Country Selection */}
        {step === 1 && (
          <div className="fade-in-up">
            <div className="text-label text-deevo-gold tracking-widest mb-3">STEP 1 OF 3</div>
            <h2 className="text-xl font-semibold text-deevo-text-primary mb-2 tracking-tight">
              Select Your Primary Region
            </h2>
            <p className="text-[13px] text-deevo-text-secondary mb-6">
              Choose a GCC country for focused analysis, or monitor the entire Gulf.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => setSelectedCountry("ALL")}
                className={`exec-card rounded-xl p-4 text-center transition-all ${
                  selectedCountry === "ALL"
                    ? "border-deevo-accent bg-deevo-accent/5"
                    : ""
                }`}
              >
                <div className="text-lg mb-1">🌐</div>
                <div className="text-[12px] font-medium text-deevo-text-primary">All GCC</div>
                <div className="text-[10px] text-deevo-text-muted">6 countries</div>
              </button>
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setSelectedCountry(c.code)}
                  className={`exec-card rounded-xl p-4 text-center transition-all ${
                    selectedCountry === c.code
                      ? "border-deevo-accent bg-deevo-accent/5"
                      : ""
                  }`}
                >
                  <div className="text-lg mb-1">{c.flag}</div>
                  <div className="text-[12px] font-medium text-deevo-text-primary">{c.name}</div>
                  <div className="text-[10px] text-deevo-text-muted font-mono">{c.code}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-deevo-accent text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              Continue → Select Sectors
            </button>
          </div>
        )}

        {/* Step 2: Sector Selection */}
        {step === 2 && (
          <div className="fade-in-up">
            <div className="text-label text-deevo-gold tracking-widest mb-3">STEP 2 OF 3</div>
            <h2 className="text-xl font-semibold text-deevo-text-primary mb-2 tracking-tight">
              Select Sectors of Interest
            </h2>
            <p className="text-[13px] text-deevo-text-secondary mb-4">
              Pick the industries you want to monitor. The pipeline analyzes all 20 regardless — this sets your priority view.
            </p>

            <button
              onClick={selectAllSectors}
              className="text-[11px] text-deevo-accent hover:text-blue-400 mb-4 transition-colors"
            >
              Select all 20 sectors
            </button>

            <div className="space-y-5 mb-6 max-h-[400px] overflow-y-auto pr-1">
              {SECTOR_GROUPS.map((group) => (
                <div key={group.tier}>
                  <div className="text-label text-deevo-text-muted mb-2">
                    TIER {group.tier} — {group.name}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.sectors.map((s) => {
                      const active = selectedSectors.has(s);
                      const label = s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                      return (
                        <button
                          key={s}
                          onClick={() => toggleSector(s)}
                          className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all ${
                            active
                              ? "border-deevo-accent bg-deevo-accent/8 text-deevo-accent"
                              : "border-deevo-border-subtle text-deevo-text-muted hover:text-deevo-text-secondary"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 border border-deevo-border text-deevo-text-secondary rounded-xl text-sm hover:border-deevo-text-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-deevo-accent text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Continue → Activate
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Activate */}
        {step === 3 && (
          <div className="fade-in-up text-center">
            <div className="text-label text-deevo-gold tracking-widest mb-3">STEP 3 OF 3</div>
            <h2 className="text-xl font-semibold text-deevo-text-primary mb-2 tracking-tight">
              Activate Intelligence
            </h2>
            <p className="text-[13px] text-deevo-text-secondary mb-6 max-w-sm mx-auto">
              Your configuration is ready. One click starts the 12-stage pipeline
              and delivers live intelligence to your command center.
            </p>

            {/* Config summary */}
            <div className="exec-card rounded-xl p-5 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4 text-[12px]">
                <div>
                  <div className="text-label text-deevo-text-muted mb-1">Region</div>
                  <div className="text-deevo-text-primary font-medium">
                    {selectedCountry === "ALL" ? "All GCC (6 countries)" : COUNTRIES.find((c) => c.code === selectedCountry)?.name || selectedCountry}
                  </div>
                </div>
                <div>
                  <div className="text-label text-deevo-text-muted mb-1">Sectors</div>
                  <div className="text-deevo-text-primary font-medium">
                    {selectedSectors.size === 0 ? "All 20 (default)" : `${selectedSectors.size} selected`}
                  </div>
                </div>
                <div>
                  <div className="text-label text-deevo-text-muted mb-1">Pipeline</div>
                  <div className="text-deevo-text-primary font-medium">12-stage deterministic</div>
                </div>
                <div>
                  <div className="text-label text-deevo-text-muted mb-1">Mode</div>
                  <div className="text-deevo-text-primary font-medium">Real-time analysis</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-3 border border-deevo-border text-deevo-text-secondary rounded-xl text-sm hover:border-deevo-text-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleActivate}
                disabled={activating || ingestionRunning}
                className="px-8 py-3 bg-deevo-gold text-black rounded-xl text-sm font-bold hover:bg-deevo-gold/90 transition-colors disabled:opacity-40 shadow-glow-gold"
              >
                {activating || ingestionRunning ? "Activating..." : "Start Intelligence"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
