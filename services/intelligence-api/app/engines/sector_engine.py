"""
Sector Exposure Engine — 4-Tier Sovereign-Grade Sector Intelligence.

Tier 1: Critical Sovereign (Aviation, Oil & Gas, Banking, Energy Infra, Ports, Logistics)
Tier 2: Financial & Economic (Insurance, Fintech, Capital Markets, SWFs, Gov Finance)
Tier 3: Market & Growth (E-Commerce, Construction, Manufacturing, Tourism, Retail)
Tier 4: Future & Strategic (AI/Tech, Startups, Cybersecurity, Sustainability)

Each sector:
- receives input from GDP + country + macro
- applies tier-based weighting
- adjusts exposure based on criticality
- generates bilingual explanation
- outputs structured result
"""
from ..schemas.scenario import SectorCode, GCCCountryCode, GDPComponentCode, LanguageVariant
from ..schemas.macro import MacroSignalSet, MacroSignalType
from ..schemas.sector import (
    SectorExposure, SectorExposureResult, SectorProfile,
    SectorTier, PropagationSpeed, CountrySectorWeight,
)


# ─── TIER MULTIPLIERS ─────────────────────────────────────
# Tier 1 gets highest weight in all calculations.
TIER_MULTIPLIER = {
    SectorTier.CRITICAL_SOVEREIGN: 1.40,
    SectorTier.FINANCIAL_ECONOMIC: 1.15,
    SectorTier.MARKET_GROWTH: 0.90,
    SectorTier.FUTURE_STRATEGIC: 0.70,
}

TIER_DECISION_BOOST = {
    SectorTier.CRITICAL_SOVEREIGN: 25.0,
    SectorTier.FINANCIAL_ECONOMIC: 15.0,
    SectorTier.MARKET_GROWTH: 5.0,
    SectorTier.FUTURE_STRATEGIC: 0.0,
}


# ─── FULL SECTOR PROFILES ────────────────────────────────
SECTOR_PROFILES: dict[SectorCode, SectorProfile] = {
    # ══════ TIER 1 — CRITICAL SOVEREIGN ══════
    SectorCode.AVIATION: SectorProfile(
        sector_code=SectorCode.AVIATION,
        name=LanguageVariant(en="Aviation", ar="الطيران"),
        tier=SectorTier.CRITICAL_SOVEREIGN,
        criticality_score=95.0,
        gdp_linkage=[GDPComponentCode.NET_EXPORTS, GDPComponentCode.HOUSEHOLD_CONSUMPTION, GDPComponentCode.BUSINESS_INVESTMENT],
        public_sector_dependency=0.70,
        private_sector_dependency=0.85,
        sensitivity_profile={
            MacroSignalType.TRADE_RISK.value: 0.90,
            MacroSignalType.SHIPPING_PRESSURE.value: 0.85,
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.80,
            MacroSignalType.ENERGY_EXPOSURE.value: 0.70,
            MacroSignalType.DEMAND_PRESSURE.value: 0.75,
            MacroSignalType.INFLATION_PRESSURE.value: 0.50,
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.45,
            MacroSignalType.REGULATORY_PRESSURE.value: 0.40,
        },
        propagation_speed=PropagationSpeed.IMMEDIATE,
        decision_priority_base=90.0,
    ),
    SectorCode.OIL_GAS: SectorProfile(
        sector_code=SectorCode.OIL_GAS,
        name=LanguageVariant(en="Oil & Gas / Energy", ar="النفط والغاز / الطاقة"),
        tier=SectorTier.CRITICAL_SOVEREIGN,
        criticality_score=98.0,
        gdp_linkage=[GDPComponentCode.NET_EXPORTS, GDPComponentCode.GOVERNMENT_SPENDING],
        public_sector_dependency=0.90,
        private_sector_dependency=0.50,
        sensitivity_profile={
            MacroSignalType.ENERGY_EXPOSURE.value: 0.95,
            MacroSignalType.TRADE_RISK.value: 0.70,
            MacroSignalType.SHIPPING_PRESSURE.value: 0.65,
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.45,
            MacroSignalType.REGULATORY_PRESSURE.value: 0.40,
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.35,
            MacroSignalType.DEMAND_PRESSURE.value: 0.30,
            MacroSignalType.INFLATION_PRESSURE.value: 0.25,
        },
        propagation_speed=PropagationSpeed.IMMEDIATE,
        decision_priority_base=95.0,
    ),
    SectorCode.BANKING: SectorProfile(
        sector_code=SectorCode.BANKING,
        name=LanguageVariant(en="Banking System", ar="النظام المصرفي"),
        tier=SectorTier.CRITICAL_SOVEREIGN,
        criticality_score=96.0,
        gdp_linkage=[GDPComponentCode.BUSINESS_INVESTMENT, GDPComponentCode.HOUSEHOLD_CONSUMPTION],
        public_sector_dependency=0.60,
        private_sector_dependency=0.95,
        sensitivity_profile={
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.95,
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.85,
            MacroSignalType.DEMAND_PRESSURE.value: 0.60,
            MacroSignalType.REGULATORY_PRESSURE.value: 0.55,
            MacroSignalType.INFLATION_PRESSURE.value: 0.45,
            MacroSignalType.TRADE_RISK.value: 0.40,
            MacroSignalType.ENERGY_EXPOSURE.value: 0.30,
            MacroSignalType.SHIPPING_PRESSURE.value: 0.20,
        },
        propagation_speed=PropagationSpeed.IMMEDIATE,
        decision_priority_base=92.0,
    ),
    SectorCode.ENERGY_INFRASTRUCTURE: SectorProfile(
        sector_code=SectorCode.ENERGY_INFRASTRUCTURE,
        name=LanguageVariant(en="Energy Infrastructure", ar="البنية التحتية للطاقة"),
        tier=SectorTier.CRITICAL_SOVEREIGN,
        criticality_score=90.0,
        gdp_linkage=[GDPComponentCode.GOVERNMENT_SPENDING, GDPComponentCode.BUSINESS_INVESTMENT],
        public_sector_dependency=0.85,
        private_sector_dependency=0.55,
        sensitivity_profile={
            MacroSignalType.ENERGY_EXPOSURE.value: 0.90,
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.70,
            MacroSignalType.REGULATORY_PRESSURE.value: 0.65,
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.50,
            MacroSignalType.INFLATION_PRESSURE.value: 0.45,
            MacroSignalType.TRADE_RISK.value: 0.35,
            MacroSignalType.DEMAND_PRESSURE.value: 0.30,
            MacroSignalType.SHIPPING_PRESSURE.value: 0.25,
        },
        propagation_speed=PropagationSpeed.FAST,
        decision_priority_base=88.0,
    ),
    SectorCode.PORTS_MARITIME: SectorProfile(
        sector_code=SectorCode.PORTS_MARITIME,
        name=LanguageVariant(en="Ports & Maritime", ar="الموانئ والنقل البحري"),
        tier=SectorTier.CRITICAL_SOVEREIGN,
        criticality_score=92.0,
        gdp_linkage=[GDPComponentCode.NET_EXPORTS, GDPComponentCode.BUSINESS_INVESTMENT],
        public_sector_dependency=0.75,
        private_sector_dependency=0.80,
        sensitivity_profile={
            MacroSignalType.SHIPPING_PRESSURE.value: 0.95,
            MacroSignalType.TRADE_RISK.value: 0.90,
            MacroSignalType.ENERGY_EXPOSURE.value: 0.50,
            MacroSignalType.DEMAND_PRESSURE.value: 0.45,
            MacroSignalType.INFLATION_PRESSURE.value: 0.40,
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.35,
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.30,
            MacroSignalType.REGULATORY_PRESSURE.value: 0.35,
        },
        propagation_speed=PropagationSpeed.IMMEDIATE,
        decision_priority_base=90.0,
    ),
    SectorCode.LOGISTICS: SectorProfile(
        sector_code=SectorCode.LOGISTICS,
        name=LanguageVariant(en="Logistics & Trade Corridors", ar="الخدمات اللوجستية وممرات التجارة"),
        tier=SectorTier.CRITICAL_SOVEREIGN,
        criticality_score=91.0,
        gdp_linkage=[GDPComponentCode.NET_EXPORTS, GDPComponentCode.BUSINESS_INVESTMENT],
        public_sector_dependency=0.55,
        private_sector_dependency=0.90,
        sensitivity_profile={
            MacroSignalType.SHIPPING_PRESSURE.value: 0.90,
            MacroSignalType.TRADE_RISK.value: 0.90,
            MacroSignalType.INFLATION_PRESSURE.value: 0.55,
            MacroSignalType.DEMAND_PRESSURE.value: 0.50,
            MacroSignalType.ENERGY_EXPOSURE.value: 0.45,
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.40,
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.35,
            MacroSignalType.REGULATORY_PRESSURE.value: 0.30,
        },
        propagation_speed=PropagationSpeed.IMMEDIATE,
        decision_priority_base=89.0,
    ),
    # ══════ TIER 2 — FINANCIAL & ECONOMIC ══════
    SectorCode.INSURANCE: SectorProfile(
        sector_code=SectorCode.INSURANCE,
        name=LanguageVariant(en="Insurance", ar="التأمين"),
        tier=SectorTier.FINANCIAL_ECONOMIC,
        criticality_score=78.0,
        gdp_linkage=[GDPComponentCode.BUSINESS_INVESTMENT, GDPComponentCode.NET_EXPORTS],
        public_sector_dependency=0.40,
        private_sector_dependency=0.85,
        sensitivity_profile={
            MacroSignalType.TRADE_RISK.value: 0.80,
            MacroSignalType.SHIPPING_PRESSURE.value: 0.75,
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.65,
            MacroSignalType.INFLATION_PRESSURE.value: 0.55,
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.50,
            MacroSignalType.REGULATORY_PRESSURE.value: 0.60,
            MacroSignalType.DEMAND_PRESSURE.value: 0.40,
            MacroSignalType.ENERGY_EXPOSURE.value: 0.35,
        },
        propagation_speed=PropagationSpeed.FAST,
        decision_priority_base=75.0,
    ),
    SectorCode.FINTECH: SectorProfile(
        sector_code=SectorCode.FINTECH,
        name=LanguageVariant(en="Fintech", ar="التقنية المالية"),
        tier=SectorTier.FINANCIAL_ECONOMIC,
        criticality_score=72.0,
        gdp_linkage=[GDPComponentCode.BUSINESS_INVESTMENT, GDPComponentCode.HOUSEHOLD_CONSUMPTION],
        public_sector_dependency=0.30,
        private_sector_dependency=0.90,
        sensitivity_profile={
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.85,
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.80,
            MacroSignalType.DEMAND_PRESSURE.value: 0.65,
            MacroSignalType.REGULATORY_PRESSURE.value: 0.60,
            MacroSignalType.INFLATION_PRESSURE.value: 0.35,
            MacroSignalType.TRADE_RISK.value: 0.25,
            MacroSignalType.ENERGY_EXPOSURE.value: 0.15,
            MacroSignalType.SHIPPING_PRESSURE.value: 0.10,
        },
        propagation_speed=PropagationSpeed.FAST,
        decision_priority_base=70.0,
    ),
    SectorCode.CAPITAL_MARKETS: SectorProfile(
        sector_code=SectorCode.CAPITAL_MARKETS,
        name=LanguageVariant(en="Capital Markets", ar="أسواق المال"),
        tier=SectorTier.FINANCIAL_ECONOMIC,
        criticality_score=80.0,
        gdp_linkage=[GDPComponentCode.BUSINESS_INVESTMENT, GDPComponentCode.HOUSEHOLD_CONSUMPTION],
        public_sector_dependency=0.50,
        private_sector_dependency=0.90,
        sensitivity_profile={
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.90,
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.85,
            MacroSignalType.DEMAND_PRESSURE.value: 0.55,
            MacroSignalType.INFLATION_PRESSURE.value: 0.50,
            MacroSignalType.REGULATORY_PRESSURE.value: 0.45,
            MacroSignalType.TRADE_RISK.value: 0.35,
            MacroSignalType.ENERGY_EXPOSURE.value: 0.40,
            MacroSignalType.SHIPPING_PRESSURE.value: 0.20,
        },
        propagation_speed=PropagationSpeed.IMMEDIATE,
        decision_priority_base=78.0,
    ),
    SectorCode.SOVEREIGN_WEALTH: SectorProfile(
        sector_code=SectorCode.SOVEREIGN_WEALTH,
        name=LanguageVariant(en="Sovereign Wealth Funds", ar="صناديق الثروة السيادية"),
        tier=SectorTier.FINANCIAL_ECONOMIC,
        criticality_score=85.0,
        gdp_linkage=[GDPComponentCode.GOVERNMENT_SPENDING, GDPComponentCode.BUSINESS_INVESTMENT],
        public_sector_dependency=0.95,
        private_sector_dependency=0.30,
        sensitivity_profile={
            MacroSignalType.ENERGY_EXPOSURE.value: 0.85,
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.70,
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.60,
            MacroSignalType.TRADE_RISK.value: 0.45,
            MacroSignalType.REGULATORY_PRESSURE.value: 0.30,
            MacroSignalType.INFLATION_PRESSURE.value: 0.25,
            MacroSignalType.DEMAND_PRESSURE.value: 0.20,
            MacroSignalType.SHIPPING_PRESSURE.value: 0.15,
        },
        propagation_speed=PropagationSpeed.MEDIUM,
        decision_priority_base=80.0,
    ),
    SectorCode.GOVERNMENT_FINANCE: SectorProfile(
        sector_code=SectorCode.GOVERNMENT_FINANCE,
        name=LanguageVariant(en="Government Finance", ar="المالية الحكومية"),
        tier=SectorTier.FINANCIAL_ECONOMIC,
        criticality_score=88.0,
        gdp_linkage=[GDPComponentCode.GOVERNMENT_SPENDING],
        public_sector_dependency=0.95,
        private_sector_dependency=0.20,
        sensitivity_profile={
            MacroSignalType.ENERGY_EXPOSURE.value: 0.90,
            MacroSignalType.REGULATORY_PRESSURE.value: 0.75,
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.55,
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.50,
            MacroSignalType.INFLATION_PRESSURE.value: 0.45,
            MacroSignalType.TRADE_RISK.value: 0.35,
            MacroSignalType.DEMAND_PRESSURE.value: 0.25,
            MacroSignalType.SHIPPING_PRESSURE.value: 0.15,
        },
        propagation_speed=PropagationSpeed.FAST,
        decision_priority_base=82.0,
    ),
    # ══════ TIER 3 — MARKET & GROWTH ══════
    SectorCode.ECOMMERCE: SectorProfile(
        sector_code=SectorCode.ECOMMERCE,
        name=LanguageVariant(en="E-Commerce", ar="التجارة الإلكترونية"),
        tier=SectorTier.MARKET_GROWTH,
        criticality_score=55.0,
        gdp_linkage=[GDPComponentCode.HOUSEHOLD_CONSUMPTION, GDPComponentCode.NET_EXPORTS],
        public_sector_dependency=0.15,
        private_sector_dependency=0.95,
        sensitivity_profile={
            MacroSignalType.DEMAND_PRESSURE.value: 0.85,
            MacroSignalType.SHIPPING_PRESSURE.value: 0.70,
            MacroSignalType.INFLATION_PRESSURE.value: 0.65,
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.55,
            MacroSignalType.TRADE_RISK.value: 0.50,
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.35,
            MacroSignalType.REGULATORY_PRESSURE.value: 0.30,
            MacroSignalType.ENERGY_EXPOSURE.value: 0.15,
        },
        propagation_speed=PropagationSpeed.MEDIUM,
        decision_priority_base=50.0,
    ),
    SectorCode.CONSTRUCTION: SectorProfile(
        sector_code=SectorCode.CONSTRUCTION,
        name=LanguageVariant(en="Construction", ar="البناء والتشييد"),
        tier=SectorTier.MARKET_GROWTH,
        criticality_score=65.0,
        gdp_linkage=[GDPComponentCode.GOVERNMENT_SPENDING, GDPComponentCode.BUSINESS_INVESTMENT],
        public_sector_dependency=0.70,
        private_sector_dependency=0.75,
        sensitivity_profile={
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.80,
            MacroSignalType.REGULATORY_PRESSURE.value: 0.65,
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.60,
            MacroSignalType.DEMAND_PRESSURE.value: 0.55,
            MacroSignalType.INFLATION_PRESSURE.value: 0.55,
            MacroSignalType.TRADE_RISK.value: 0.35,
            MacroSignalType.ENERGY_EXPOSURE.value: 0.30,
            MacroSignalType.SHIPPING_PRESSURE.value: 0.25,
        },
        propagation_speed=PropagationSpeed.MEDIUM,
        decision_priority_base=58.0,
    ),
    SectorCode.MANUFACTURING: SectorProfile(
        sector_code=SectorCode.MANUFACTURING,
        name=LanguageVariant(en="Manufacturing", ar="التصنيع"),
        tier=SectorTier.MARKET_GROWTH,
        criticality_score=60.0,
        gdp_linkage=[GDPComponentCode.BUSINESS_INVESTMENT, GDPComponentCode.NET_EXPORTS],
        public_sector_dependency=0.40,
        private_sector_dependency=0.85,
        sensitivity_profile={
            MacroSignalType.TRADE_RISK.value: 0.75,
            MacroSignalType.INFLATION_PRESSURE.value: 0.70,
            MacroSignalType.SHIPPING_PRESSURE.value: 0.65,
            MacroSignalType.DEMAND_PRESSURE.value: 0.60,
            MacroSignalType.ENERGY_EXPOSURE.value: 0.55,
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.45,
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.40,
            MacroSignalType.REGULATORY_PRESSURE.value: 0.35,
        },
        propagation_speed=PropagationSpeed.MEDIUM,
        decision_priority_base=55.0,
    ),
    SectorCode.TOURISM: SectorProfile(
        sector_code=SectorCode.TOURISM,
        name=LanguageVariant(en="Tourism", ar="السياحة"),
        tier=SectorTier.MARKET_GROWTH,
        criticality_score=58.0,
        gdp_linkage=[GDPComponentCode.HOUSEHOLD_CONSUMPTION, GDPComponentCode.NET_EXPORTS],
        public_sector_dependency=0.50,
        private_sector_dependency=0.80,
        sensitivity_profile={
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.85,
            MacroSignalType.DEMAND_PRESSURE.value: 0.80,
            MacroSignalType.TRADE_RISK.value: 0.55,
            MacroSignalType.INFLATION_PRESSURE.value: 0.50,
            MacroSignalType.SHIPPING_PRESSURE.value: 0.40,
            MacroSignalType.ENERGY_EXPOSURE.value: 0.30,
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.25,
            MacroSignalType.REGULATORY_PRESSURE.value: 0.30,
        },
        propagation_speed=PropagationSpeed.FAST,
        decision_priority_base=52.0,
    ),
    SectorCode.RETAIL: SectorProfile(
        sector_code=SectorCode.RETAIL,
        name=LanguageVariant(en="Retail", ar="التجزئة"),
        tier=SectorTier.MARKET_GROWTH,
        criticality_score=50.0,
        gdp_linkage=[GDPComponentCode.HOUSEHOLD_CONSUMPTION],
        public_sector_dependency=0.15,
        private_sector_dependency=0.95,
        sensitivity_profile={
            MacroSignalType.DEMAND_PRESSURE.value: 0.90,
            MacroSignalType.INFLATION_PRESSURE.value: 0.80,
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.65,
            MacroSignalType.TRADE_RISK.value: 0.40,
            MacroSignalType.SHIPPING_PRESSURE.value: 0.35,
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.30,
            MacroSignalType.ENERGY_EXPOSURE.value: 0.15,
            MacroSignalType.REGULATORY_PRESSURE.value: 0.25,
        },
        propagation_speed=PropagationSpeed.MEDIUM,
        decision_priority_base=45.0,
    ),
    # ══════ TIER 4 — FUTURE & STRATEGIC ══════
    SectorCode.AI_TECHNOLOGY: SectorProfile(
        sector_code=SectorCode.AI_TECHNOLOGY,
        name=LanguageVariant(en="AI / Technology", ar="الذكاء الاصطناعي / التكنولوجيا"),
        tier=SectorTier.FUTURE_STRATEGIC,
        criticality_score=45.0,
        gdp_linkage=[GDPComponentCode.BUSINESS_INVESTMENT, GDPComponentCode.HOUSEHOLD_CONSUMPTION],
        public_sector_dependency=0.35,
        private_sector_dependency=0.90,
        sensitivity_profile={
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.80,
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.75,
            MacroSignalType.DEMAND_PRESSURE.value: 0.60,
            MacroSignalType.REGULATORY_PRESSURE.value: 0.50,
            MacroSignalType.INFLATION_PRESSURE.value: 0.30,
            MacroSignalType.TRADE_RISK.value: 0.25,
            MacroSignalType.ENERGY_EXPOSURE.value: 0.15,
            MacroSignalType.SHIPPING_PRESSURE.value: 0.10,
        },
        propagation_speed=PropagationSpeed.SLOW,
        decision_priority_base=40.0,
    ),
    SectorCode.STARTUP_ECOSYSTEM: SectorProfile(
        sector_code=SectorCode.STARTUP_ECOSYSTEM,
        name=LanguageVariant(en="Startup Ecosystem", ar="منظومة الشركات الناشئة"),
        tier=SectorTier.FUTURE_STRATEGIC,
        criticality_score=40.0,
        gdp_linkage=[GDPComponentCode.BUSINESS_INVESTMENT],
        public_sector_dependency=0.25,
        private_sector_dependency=0.95,
        sensitivity_profile={
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.90,
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.85,
            MacroSignalType.DEMAND_PRESSURE.value: 0.55,
            MacroSignalType.REGULATORY_PRESSURE.value: 0.45,
            MacroSignalType.INFLATION_PRESSURE.value: 0.30,
            MacroSignalType.TRADE_RISK.value: 0.20,
            MacroSignalType.ENERGY_EXPOSURE.value: 0.10,
            MacroSignalType.SHIPPING_PRESSURE.value: 0.05,
        },
        propagation_speed=PropagationSpeed.SLOW,
        decision_priority_base=35.0,
    ),
    SectorCode.CYBERSECURITY: SectorProfile(
        sector_code=SectorCode.CYBERSECURITY,
        name=LanguageVariant(en="Cybersecurity", ar="الأمن السيبراني"),
        tier=SectorTier.FUTURE_STRATEGIC,
        criticality_score=48.0,
        gdp_linkage=[GDPComponentCode.BUSINESS_INVESTMENT, GDPComponentCode.GOVERNMENT_SPENDING],
        public_sector_dependency=0.55,
        private_sector_dependency=0.80,
        sensitivity_profile={
            MacroSignalType.REGULATORY_PRESSURE.value: 0.80,
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.70,
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.55,
            MacroSignalType.DEMAND_PRESSURE.value: 0.40,
            MacroSignalType.TRADE_RISK.value: 0.35,
            MacroSignalType.INFLATION_PRESSURE.value: 0.20,
            MacroSignalType.ENERGY_EXPOSURE.value: 0.15,
            MacroSignalType.SHIPPING_PRESSURE.value: 0.10,
        },
        propagation_speed=PropagationSpeed.SLOW,
        decision_priority_base=42.0,
    ),
    SectorCode.SUSTAINABILITY: SectorProfile(
        sector_code=SectorCode.SUSTAINABILITY,
        name=LanguageVariant(en="Sustainability / Energy Transition", ar="الاستدامة / تحول الطاقة"),
        tier=SectorTier.FUTURE_STRATEGIC,
        criticality_score=42.0,
        gdp_linkage=[GDPComponentCode.GOVERNMENT_SPENDING, GDPComponentCode.BUSINESS_INVESTMENT],
        public_sector_dependency=0.65,
        private_sector_dependency=0.60,
        sensitivity_profile={
            MacroSignalType.ENERGY_EXPOSURE.value: 0.75,
            MacroSignalType.REGULATORY_PRESSURE.value: 0.70,
            MacroSignalType.CONFIDENCE_PRESSURE.value: 0.55,
            MacroSignalType.FINANCING_SENSITIVITY.value: 0.50,
            MacroSignalType.DEMAND_PRESSURE.value: 0.30,
            MacroSignalType.TRADE_RISK.value: 0.25,
            MacroSignalType.INFLATION_PRESSURE.value: 0.20,
            MacroSignalType.SHIPPING_PRESSURE.value: 0.10,
        },
        propagation_speed=PropagationSpeed.SLOW,
        decision_priority_base=38.0,
    ),
}


# ─── COUNTRY-SECTOR WEIGHTS ──────────────────────────────
# Each GCC country weights sectors differently.
COUNTRY_SECTOR_WEIGHTS: dict[GCCCountryCode, dict[SectorCode, float]] = {
    GCCCountryCode.SA: {
        SectorCode.OIL_GAS: 0.95, SectorCode.GOVERNMENT_FINANCE: 0.90,
        SectorCode.CONSTRUCTION: 0.85, SectorCode.BANKING: 0.80,
        SectorCode.ENERGY_INFRASTRUCTURE: 0.85, SectorCode.PORTS_MARITIME: 0.70,
        SectorCode.LOGISTICS: 0.70, SectorCode.AVIATION: 0.65,
        SectorCode.SOVEREIGN_WEALTH: 0.80, SectorCode.CAPITAL_MARKETS: 0.60,
        SectorCode.INSURANCE: 0.55, SectorCode.FINTECH: 0.50,
        SectorCode.TOURISM: 0.60, SectorCode.RETAIL: 0.50,
        SectorCode.ECOMMERCE: 0.45, SectorCode.MANUFACTURING: 0.55,
        SectorCode.AI_TECHNOLOGY: 0.50, SectorCode.STARTUP_ECOSYSTEM: 0.40,
        SectorCode.CYBERSECURITY: 0.45, SectorCode.SUSTAINABILITY: 0.50,
    },
    GCCCountryCode.AE: {
        SectorCode.AVIATION: 0.95, SectorCode.LOGISTICS: 0.90,
        SectorCode.PORTS_MARITIME: 0.90, SectorCode.BANKING: 0.85,
        SectorCode.OIL_GAS: 0.60, SectorCode.TOURISM: 0.85,
        SectorCode.CAPITAL_MARKETS: 0.80, SectorCode.FINTECH: 0.80,
        SectorCode.ECOMMERCE: 0.75, SectorCode.CONSTRUCTION: 0.70,
        SectorCode.INSURANCE: 0.65, SectorCode.ENERGY_INFRASTRUCTURE: 0.60,
        SectorCode.SOVEREIGN_WEALTH: 0.75, SectorCode.GOVERNMENT_FINANCE: 0.55,
        SectorCode.RETAIL: 0.70, SectorCode.MANUFACTURING: 0.50,
        SectorCode.AI_TECHNOLOGY: 0.70, SectorCode.STARTUP_ECOSYSTEM: 0.75,
        SectorCode.CYBERSECURITY: 0.60, SectorCode.SUSTAINABILITY: 0.55,
    },
    GCCCountryCode.KW: {
        SectorCode.OIL_GAS: 0.95, SectorCode.GOVERNMENT_FINANCE: 0.90,
        SectorCode.SOVEREIGN_WEALTH: 0.85, SectorCode.BANKING: 0.75,
        SectorCode.ENERGY_INFRASTRUCTURE: 0.70, SectorCode.CONSTRUCTION: 0.60,
        SectorCode.PORTS_MARITIME: 0.55, SectorCode.LOGISTICS: 0.50,
        SectorCode.AVIATION: 0.50, SectorCode.CAPITAL_MARKETS: 0.55,
        SectorCode.INSURANCE: 0.45, SectorCode.FINTECH: 0.35,
        SectorCode.TOURISM: 0.30, SectorCode.RETAIL: 0.40,
        SectorCode.ECOMMERCE: 0.35, SectorCode.MANUFACTURING: 0.30,
        SectorCode.AI_TECHNOLOGY: 0.30, SectorCode.STARTUP_ECOSYSTEM: 0.25,
        SectorCode.CYBERSECURITY: 0.30, SectorCode.SUSTAINABILITY: 0.35,
    },
    GCCCountryCode.QA: {
        SectorCode.OIL_GAS: 0.90, SectorCode.ENERGY_INFRASTRUCTURE: 0.85,
        SectorCode.SOVEREIGN_WEALTH: 0.85, SectorCode.GOVERNMENT_FINANCE: 0.80,
        SectorCode.BANKING: 0.70, SectorCode.AVIATION: 0.75,
        SectorCode.PORTS_MARITIME: 0.65, SectorCode.LOGISTICS: 0.60,
        SectorCode.CONSTRUCTION: 0.65, SectorCode.CAPITAL_MARKETS: 0.60,
        SectorCode.INSURANCE: 0.50, SectorCode.FINTECH: 0.45,
        SectorCode.TOURISM: 0.55, SectorCode.RETAIL: 0.45,
        SectorCode.ECOMMERCE: 0.40, SectorCode.MANUFACTURING: 0.35,
        SectorCode.AI_TECHNOLOGY: 0.45, SectorCode.STARTUP_ECOSYSTEM: 0.40,
        SectorCode.CYBERSECURITY: 0.40, SectorCode.SUSTAINABILITY: 0.50,
    },
    GCCCountryCode.BH: {
        SectorCode.BANKING: 0.90, SectorCode.INSURANCE: 0.80,
        SectorCode.FINTECH: 0.75, SectorCode.CAPITAL_MARKETS: 0.70,
        SectorCode.OIL_GAS: 0.55, SectorCode.GOVERNMENT_FINANCE: 0.65,
        SectorCode.TOURISM: 0.60, SectorCode.AVIATION: 0.55,
        SectorCode.PORTS_MARITIME: 0.50, SectorCode.LOGISTICS: 0.50,
        SectorCode.CONSTRUCTION: 0.50, SectorCode.ENERGY_INFRASTRUCTURE: 0.45,
        SectorCode.SOVEREIGN_WEALTH: 0.40, SectorCode.RETAIL: 0.55,
        SectorCode.ECOMMERCE: 0.50, SectorCode.MANUFACTURING: 0.40,
        SectorCode.AI_TECHNOLOGY: 0.45, SectorCode.STARTUP_ECOSYSTEM: 0.55,
        SectorCode.CYBERSECURITY: 0.40, SectorCode.SUSTAINABILITY: 0.35,
    },
    GCCCountryCode.OM: {
        SectorCode.OIL_GAS: 0.85, SectorCode.LOGISTICS: 0.80,
        SectorCode.PORTS_MARITIME: 0.75, SectorCode.ENERGY_INFRASTRUCTURE: 0.70,
        SectorCode.GOVERNMENT_FINANCE: 0.75, SectorCode.CONSTRUCTION: 0.65,
        SectorCode.BANKING: 0.60, SectorCode.AVIATION: 0.55,
        SectorCode.MANUFACTURING: 0.60, SectorCode.TOURISM: 0.55,
        SectorCode.SOVEREIGN_WEALTH: 0.50, SectorCode.CAPITAL_MARKETS: 0.45,
        SectorCode.INSURANCE: 0.45, SectorCode.FINTECH: 0.35,
        SectorCode.RETAIL: 0.40, SectorCode.ECOMMERCE: 0.35,
        SectorCode.AI_TECHNOLOGY: 0.30, SectorCode.STARTUP_ECOSYSTEM: 0.25,
        SectorCode.CYBERSECURITY: 0.30, SectorCode.SUSTAINABILITY: 0.45,
    },
}


# ─── SECTOR NAMES (BILINGUAL) ────────────────────────────
def _sector_name(code: SectorCode) -> LanguageVariant:
    profile = SECTOR_PROFILES.get(code)
    if profile:
        return profile.name
    return LanguageVariant(en=code.value.replace("_", " ").title(), ar=code.value)


class SectorEngine:
    """
    4-tier sector exposure engine. Computes exposure with:
    - tier-based weighting
    - criticality adjustment
    - country-specific weights
    - propagation speed classification
    - deterministic, explainable scoring
    """

    def run(
        self,
        macro_signals: MacroSignalSet,
        scenario_id: str,
        affected_sectors: list[SectorCode] | None = None,
    ) -> SectorExposureResult:
        sectors = affected_sectors or list(SectorCode)
        exposures = []

        for sector in sectors:
            profile = SECTOR_PROFILES.get(sector)
            if not profile:
                continue

            raw_score, drivers = self._compute_exposure(macro_signals, profile)
            tier_mult = TIER_MULTIPLIER[profile.tier]
            criticality_adjusted = min(raw_score * tier_mult * (profile.criticality_score / 80.0), 100.0)
            decision_boost = TIER_DECISION_BOOST[profile.tier]
            decision_rel = min(criticality_adjusted * 0.7 + decision_boost + len(drivers) * 2, 100.0)

            name = _sector_name(sector)
            tier_label = profile.tier.name.replace("_", " ").title()

            exposures.append(SectorExposure(
                sector_code=sector,
                tier=profile.tier,
                exposure_score=round(raw_score, 1),
                criticality_adjusted_score=round(criticality_adjusted, 1),
                impact_drivers=drivers,
                country_context=list(GCCCountryCode),
                gdp_linkage=profile.gdp_linkage,
                decision_relevance=round(decision_rel, 1),
                propagation_speed=profile.propagation_speed,
                narrative=LanguageVariant(
                    en=f"{name.en} [Tier {profile.tier.value} — {tier_label}] "
                       f"exposure at {raw_score:.0f}/100 (criticality-adjusted: {criticality_adjusted:.0f}). "
                       f"Driven by {', '.join(drivers[:3])}. "
                       f"GDP linkage: {', '.join(c.value for c in profile.gdp_linkage)}. "
                       f"Propagation: {profile.propagation_speed.value}.",
                    ar=f"{name.ar} [المستوى {profile.tier.value}] "
                       f"التعرض عند {raw_score:.0f}/100 (معدّل الحرجية: {criticality_adjusted:.0f}). "
                       f"مدفوع بـ {', '.join(drivers[:3])}.",
                ),
            ))

        # Sort by criticality-adjusted score (Tier 1 dominates)
        exposures.sort(key=lambda e: e.criticality_adjusted_score, reverse=True)

        # Build tier summary
        tier_summary = {}
        for tier in SectorTier:
            tier_exps = [e for e in exposures if e.tier == tier]
            if tier_exps:
                tier_summary[tier.name] = round(
                    sum(e.criticality_adjusted_score for e in tier_exps) / len(tier_exps), 1
                )

        return SectorExposureResult(
            scenario_id=scenario_id,
            exposures=exposures,
            tier_summary=tier_summary,
        )

    def _compute_exposure(
        self,
        signals: MacroSignalSet,
        profile: SectorProfile,
    ) -> tuple[float, list[str]]:
        """Compute sector exposure score and identify top drivers."""
        weighted_impacts: list[tuple[str, float]] = []
        sensitivity = profile.sensitivity_profile

        for signal in signals.signals:
            weight = sensitivity.get(signal.type.value, 0.1)
            impact = abs(signal.magnitude) * weight * 100
            weighted_impacts.append((signal.type.value, impact))

        weighted_impacts.sort(key=lambda x: x[1], reverse=True)
        total_score = sum(v for _, v in weighted_impacts) / max(len(weighted_impacts), 1)
        top_drivers = [name.replace("_", " ").title() for name, _ in weighted_impacts[:5]]

        return min(total_score * 1.4, 100.0), top_drivers
