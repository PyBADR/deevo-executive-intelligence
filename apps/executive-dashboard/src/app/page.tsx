"use client";

/**
 * Landing Page — Deevo Executive Intelligence
 *
 * Impact-first marketing surface. Strong headline, clear value prop,
 * dual CTAs, cinematic visual identity. No clutter.
 */

import Link from "next/link";
import { BRANDING } from "@/config/branding";
import { useEffect, useState, useRef } from "react";

// ─── Data ────────────────────────────────────────────────────────

const CAPABILITIES = [
  {
    icon: "⬡",
    title: "Real-Time Command Center",
    stat: "4 live panels",
    description:
      "Composite scores, KPI strips, decision queues, and severity-glow alerts — one screen, zero lag.",
  },
  {
    icon: "◈",
    title: "6-Country GCC Coverage",
    stat: "SA · AE · KW · QA · BH · OM",
    description:
      "Macro sensitivity scoring for every GCC economy with public/private sector split and GDP impact modeling.",
  },
  {
    icon: "◇",
    title: "20-Sector Exposure Model",
    stat: "4-tier criticality",
    description:
      "From sovereign energy to fintech startups — propagation speed, decision relevance, and cross-sector contagion built in.",
  },
  {
    icon: "▸",
    title: "Decision Intelligence",
    stat: "Full reasoning chains",
    description:
      "Prioritized executive recommendations: what happened, why it matters, who is affected, what to do next.",
  },
  {
    icon: "≡",
    title: "Executive Narratives",
    stat: "Bilingual EN/AR",
    description:
      "Plain-language intelligence briefs written for ministers, board members, and institutional investors. No jargon.",
  },
  {
    icon: "!",
    title: "Threshold Alert System",
    stat: "10 configurable rules",
    description:
      "Decision pressure, sector exposure, country sensitivity, aggregate risk — with acknowledge, mute, and severity filtering.",
  },
];

const PIPELINE_STAGES = BRANDING.pipeline.stageNames;

const COUNTRIES = [
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭" },
  { code: "OM", name: "Oman", flag: "🇴🇲" },
];

const TRUST_MARKERS = [
  { metric: "12", label: "Pipeline Stages", highlight: false },
  { metric: "20", label: "Sectors Analyzed", highlight: false },
  { metric: "6", label: "GCC Economies", highlight: false },
  { metric: "0", label: "Hallucinations", highlight: true },
  { metric: "37", label: "API Endpoints", highlight: false },
  { metric: "100%", label: "Deterministic", highlight: true },
];

// ─── Typewriter hook ──────────────────────────────────────────────

function useTypewriter(phrases: string[], typingSpeed = 60, pauseMs = 2200) {
  const [display, setDisplay] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIdx];
    if (!deleting && charIdx < phrase.length) {
      const t = setTimeout(() => {
        setDisplay(phrase.slice(0, charIdx + 1));
        setCharIdx(charIdx + 1);
      }, typingSpeed);
      return () => clearTimeout(t);
    } else if (!deleting && charIdx === phrase.length) {
      const t = setTimeout(() => setDeleting(true), pauseMs);
      return () => clearTimeout(t);
    } else if (deleting && charIdx > 0) {
      const t = setTimeout(() => {
        setDisplay(phrase.slice(0, charIdx - 1));
        setCharIdx(charIdx - 1);
      }, typingSpeed / 2);
      return () => clearTimeout(t);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setPhraseIdx((phraseIdx + 1) % phrases.length);
    }
  }, [charIdx, deleting, phraseIdx, phrases, typingSpeed, pauseMs]);

  return display;
}

// ─── Animated counter ─────────────────────────────────────────────

function AnimatedCount({ target, suffix = "" }: { target: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const num = parseInt(target, 10);
  const isNum = !isNaN(num);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.5 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !isNum) return;
    const duration = 1200;
    const steps = 30;
    const step = Math.ceil(num / steps);
    let current = 0;
    const interval = setInterval(() => {
      current = Math.min(current + step, num);
      setCount(current);
      if (current >= num) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, [visible, isNum, num]);

  return (
    <div ref={ref} className="text-headline text-deevo-gold tabular-nums">
      {isNum ? count : target}{suffix}
    </div>
  );
}

// ─── Pipeline Stage Animator ──────────────────────────────────────

function PipelineVisual() {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % PIPELINE_STAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {PIPELINE_STAGES.map((stage, i) => {
        const isActive = i === activeStage;
        const isPast = i < activeStage;
        return (
          <div key={stage} className="flex items-center">
            <div
              className={`rounded-lg px-4 py-2.5 text-center min-w-[90px] transition-all duration-500 ${
                isActive
                  ? "bg-deevo-gold/15 border border-deevo-gold/40 shadow-[0_0_20px_rgba(212,168,83,0.15)]"
                  : isPast
                  ? "bg-emerald-500/8 border border-emerald-500/20"
                  : "exec-card"
              }`}
            >
              <div className={`text-[10px] font-mono mb-0.5 transition-colors duration-500 ${
                isActive ? "text-deevo-gold" : isPast ? "text-emerald-400/70" : "text-deevo-text-muted"
              }`}>
                {i + 1}
              </div>
              <div className={`text-[12px] font-medium transition-colors duration-500 ${
                isActive ? "text-deevo-gold" : isPast ? "text-emerald-400" : "text-deevo-text-primary"
              }`}>
                {stage}
              </div>
            </div>
            {i < PIPELINE_STAGES.length - 1 && (
              <span className={`mx-1 text-xs transition-colors duration-500 ${
                isPast ? "text-emerald-400/50" : "text-deevo-text-muted"
              }`}>→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────

export default function LandingPage() {
  const rotatingText = useTypewriter([
    "a tariff escalation hits GCC trade.",
    "oil prices shift by 15% overnight.",
    "a sovereign credit rating changes.",
    "supply chain disruptions cascade.",
    "regulatory policy tightens.",
  ]);

  return (
    <div className="min-h-screen">
      {/* ════════════════════════════════════════════════════════
          NAVIGATION
          ════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-deevo-bg/80 backdrop-blur-xl border-b border-deevo-border-subtle">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-deevo-gold font-semibold text-sm tracking-tight">
              {BRANDING.product.shortName}
            </span>
            <span className="text-[10px] text-deevo-text-muted">|</span>
            <span className="text-[11px] text-deevo-text-muted hidden sm:inline">
              {BRANDING.product.tagline}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/command-center"
              className="text-[11px] text-deevo-text-secondary hover:text-deevo-text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/pricing"
              className="text-[11px] text-deevo-text-secondary hover:text-deevo-text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/demo"
              className="text-[11px] px-4 py-1.5 bg-gradient-to-r from-deevo-gold/90 to-deevo-gold text-black rounded-lg hover:from-deevo-gold hover:to-deevo-gold/80 transition-all font-semibold"
            >
              Start Intelligence
            </Link>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════
          HERO
          ════════════════════════════════════════════════════════ */}
      <section className="pt-36 pb-24 px-6 relative overflow-hidden">
        {/* Subtle radial glow behind hero */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-deevo-gold/[0.03] rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 fade-in-up">
          <div className="text-label text-deevo-gold tracking-widest mb-6">
            SOVEREIGN-GRADE DECISION INTELLIGENCE
          </div>

          <h1 className="text-4xl md:text-[3.5rem] font-bold tracking-tight leading-[1.1] mb-6 text-deevo-text-primary">
            See the economic impact
            <br />
            <span className="text-deevo-gold">before your competitors react.</span>
          </h1>

          <p className="text-lg text-deevo-text-secondary max-w-2xl mx-auto leading-relaxed mb-4">
            When {rotatingText}
            <span className="animate-pulse text-deevo-gold">|</span>
          </p>

          <p className="text-[15px] text-deevo-text-secondary max-w-xl mx-auto leading-relaxed mb-10">
            Deevo computes the full cascade — across 6 GCC countries, 20 sectors, and 5 GDP
            components — in seconds. Deterministic. Traceable. Zero hallucination.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/demo"
              className="px-8 py-3.5 bg-gradient-to-r from-deevo-gold/90 to-deevo-gold text-black rounded-xl text-sm font-bold hover:from-deevo-gold hover:to-deevo-gold/80 transition-all shadow-[0_0_40px_rgba(212,168,83,0.2)] hover:shadow-[0_0_60px_rgba(212,168,83,0.3)]"
            >
              Start Intelligence
            </Link>
            <Link
              href="/onboarding"
              className="px-8 py-3.5 border border-deevo-border text-deevo-text-secondary rounded-xl text-sm font-medium hover:border-deevo-gold hover:text-deevo-gold transition-all"
            >
              Request Access
            </Link>
          </div>

          {/* Mini trust strip below CTAs */}
          <div className="mt-10 flex items-center justify-center gap-6 text-[11px] text-deevo-text-muted">
            <span>12-stage pipeline</span>
            <span className="w-1 h-1 bg-deevo-text-muted rounded-full" />
            <span>Zero hallucination</span>
            <span className="w-1 h-1 bg-deevo-text-muted rounded-full" />
            <span>100% deterministic</span>
            <span className="w-1 h-1 bg-deevo-text-muted rounded-full" />
            <span>PDPL compliant</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          PROBLEM → SOLUTION
          ════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 border-t border-deevo-border-subtle">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Problem */}
            <div className="fade-in-up">
              <div className="text-label text-red-400/80 tracking-widest mb-4">THE PROBLEM</div>
              <h2 className="text-xl font-semibold text-deevo-text-primary mb-4 tracking-tight">
                When a global scenario breaks, GCC decision-makers are last to know the local impact.
              </h2>
              <div className="space-y-3 text-[13px] text-deevo-text-secondary leading-relaxed">
                <p>
                  Traditional economic intelligence is built for Western markets. When tariffs shift,
                  oil prices move, or supply chains break — the analysis stops at G7 borders.
                </p>
                <p>
                  GCC executives wait days for analysts to manually assess sovereign exposure.
                  By then, the window for decisive action has closed.
                </p>
              </div>
            </div>

            {/* Solution */}
            <div className="fade-in-up" style={{ animationDelay: "150ms" }}>
              <div className="text-label text-deevo-gold tracking-widest mb-4">THE SOLUTION</div>
              <h2 className="text-xl font-semibold text-deevo-text-primary mb-4 tracking-tight">
                One click. Full intelligence. Every GCC economy. Every sector. Every decision.
              </h2>
              <div className="space-y-3 text-[13px] text-deevo-text-secondary leading-relaxed">
                <p>
                  Deevo runs a 12-stage deterministic pipeline that computes cascading impacts
                  from any global scenario across all 6 GCC economies simultaneously.
                </p>
                <p>
                  No AI-generated speculation. No hallucinated data. Every score, every risk
                  assessment, every recommendation is traceable through the complete analytical chain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          PIPELINE STAGES (animated)
          ════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 border-t border-deevo-border-subtle">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 fade-in-up">
            <div className="section-header-gold mb-3">THE PIPELINE</div>
            <h2 className="text-2xl font-semibold tracking-tight text-deevo-text-primary">
              12 Deterministic Intelligence Stages
            </h2>
            <p className="text-[13px] text-deevo-text-secondary mt-2 max-w-lg mx-auto">
              From raw scenario to executive brief — every transformation is auditable,
              every score is reproducible.
            </p>
          </div>
          <div className="fade-in-up" style={{ animationDelay: "200ms" }}>
            <PipelineVisual />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          CAPABILITIES
          ════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 border-t border-deevo-border-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 fade-in-up">
            <div className="section-header-gold mb-3">CAPABILITIES</div>
            <h2 className="text-2xl font-semibold tracking-tight text-deevo-text-primary">
              Everything a GCC Decision-Maker Needs
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAPABILITIES.map((cap, i) => (
              <div
                key={cap.title}
                className="exec-card rounded-xl p-6 fade-in-up group"
                style={{ animationDelay: `${150 + i * 60}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-xl">{cap.icon}</div>
                  <div className="text-[10px] text-deevo-gold/60 font-mono px-2 py-0.5 bg-deevo-gold/5 rounded">
                    {cap.stat}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-deevo-text-primary mb-2">
                  {cap.title}
                </h3>
                <p className="text-[12px] text-deevo-text-secondary leading-relaxed">
                  {cap.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          GCC COVERAGE
          ════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 border-t border-deevo-border-subtle">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 fade-in-up">
            <div className="section-header-gold mb-3">COVERAGE</div>
            <h2 className="text-2xl font-semibold tracking-tight text-deevo-text-primary">
              Built for the Gulf. Not Adapted from Western Models.
            </h2>
            <p className="text-[13px] text-deevo-text-secondary mt-2 max-w-md mx-auto">
              Every pipeline stage is calibrated for GCC economic structures, regulatory
              frameworks, and sovereign priorities.
            </p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 fade-in-up" style={{ animationDelay: "200ms" }}>
            {COUNTRIES.map((c) => (
              <div key={c.code} className="exec-card rounded-xl p-5 text-center group hover:border-deevo-gold/30 transition-all">
                <div className="text-3xl mb-2">{c.flag}</div>
                <div className="text-[12px] font-medium text-deevo-text-primary">{c.name}</div>
                <div className="text-[10px] text-deevo-text-muted font-mono mt-0.5">{c.code}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center fade-in-up" style={{ animationDelay: "300ms" }}>
            <div className="inline-flex items-center gap-4 text-[11px] text-deevo-text-muted">
              <span>4-Tier Sector Model</span>
              <span className="w-1 h-1 bg-deevo-text-muted rounded-full" />
              <span>20 Industry Sectors</span>
              <span className="w-1 h-1 bg-deevo-text-muted rounded-full" />
              <span>5 GDP Components</span>
              <span className="w-1 h-1 bg-deevo-text-muted rounded-full" />
              <span>Bilingual EN/AR</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          TRUST MARKERS (animated counters)
          ════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 border-t border-deevo-border-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {TRUST_MARKERS.map((m, i) => (
              <div
                key={m.label}
                className="text-center fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <AnimatedCount target={m.metric} />
                <div className={`text-[10px] mt-1 ${m.highlight ? "text-deevo-gold/70" : "text-deevo-text-muted"}`}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          CTA FOOTER
          ════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 border-t border-deevo-border-subtle relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-deevo-gold/[0.03] rounded-full blur-[100px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10 fade-in-up">
          <div className="text-label text-deevo-gold tracking-widest mb-4">
            SEE IT IN ACTION
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-deevo-text-primary mb-4">
            One click. Full GCC intelligence.
          </h2>
          <p className="text-[14px] text-deevo-text-secondary mb-8 max-w-lg mx-auto">
            Run a live economic scenario and watch the 12-stage pipeline compute impacts
            across countries, sectors, and decision queues — in real time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/demo"
              className="px-8 py-3.5 bg-gradient-to-r from-deevo-gold/90 to-deevo-gold text-black rounded-xl text-sm font-bold hover:from-deevo-gold hover:to-deevo-gold/80 transition-all shadow-[0_0_40px_rgba(212,168,83,0.2)]"
            >
              Start Intelligence
            </Link>
            <Link
              href="/onboarding"
              className="px-8 py-3.5 border border-deevo-border text-deevo-text-secondary rounded-xl text-sm font-medium hover:border-deevo-gold hover:text-deevo-gold transition-all"
            >
              Request Access
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════════════════ */}
      <footer className="py-8 px-6 border-t border-deevo-border-subtle">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-deevo-text-muted">
          <div className="flex items-center gap-3">
            <span className="text-deevo-gold font-semibold">{BRANDING.product.shortName}</span>
            <span>{BRANDING.footer.copyright}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{BRANDING.footer.builtBy}</span>
            <a
              href={BRANDING.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-deevo-text-secondary transition-colors"
            >
              GitHub: {BRANDING.creator.github.username}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
