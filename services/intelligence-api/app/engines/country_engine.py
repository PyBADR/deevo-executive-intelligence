"""
Country Impact Engine — Produces per-country intelligence with public/private split.

For each GCC country, computes macro sensitivity, risk level,
and separate public-sector vs private-sector impact profiles.
"""
from ..schemas.scenario import GCCCountryCode, LanguageVariant
from ..schemas.macro import MacroSignalSet, MacroSignalType
from ..schemas.gdp import GDPImpactResult
from ..schemas.country import PublicSectorImpact, PrivateSectorImpact, CountryImpact


# ─── Country Profiles ─────────────────────────────────────
# Static structural characteristics that shape transmission patterns.
COUNTRY_PROFILES: dict[GCCCountryCode, dict] = {
    GCCCountryCode.SA: {
        "oil_dependency": 0.65,
        "fiscal_buffer": 0.80,
        "trade_openness": 0.55,
        "diversification": 0.50,
        "private_sector_depth": 0.55,
        "startup_ecosystem": 0.45,
        "infrastructure_scale": 0.85,
        "name_en": "Saudi Arabia",
        "name_ar": "المملكة العربية السعودية",
    },
    GCCCountryCode.AE: {
        "oil_dependency": 0.30,
        "fiscal_buffer": 0.85,
        "trade_openness": 0.90,
        "diversification": 0.80,
        "private_sector_depth": 0.80,
        "startup_ecosystem": 0.75,
        "infrastructure_scale": 0.90,
        "name_en": "United Arab Emirates",
        "name_ar": "الإمارات العربية المتحدة",
    },
    GCCCountryCode.KW: {
        "oil_dependency": 0.85,
        "fiscal_buffer": 0.90,
        "trade_openness": 0.50,
        "diversification": 0.30,
        "private_sector_depth": 0.40,
        "startup_ecosystem": 0.25,
        "infrastructure_scale": 0.55,
        "name_en": "Kuwait",
        "name_ar": "الكويت",
    },
    GCCCountryCode.QA: {
        "oil_dependency": 0.60,
        "fiscal_buffer": 0.85,
        "trade_openness": 0.70,
        "diversification": 0.50,
        "private_sector_depth": 0.50,
        "startup_ecosystem": 0.40,
        "infrastructure_scale": 0.75,
        "name_en": "Qatar",
        "name_ar": "قطر",
    },
    GCCCountryCode.BH: {
        "oil_dependency": 0.45,
        "fiscal_buffer": 0.40,
        "trade_openness": 0.75,
        "diversification": 0.60,
        "private_sector_depth": 0.65,
        "startup_ecosystem": 0.55,
        "infrastructure_scale": 0.50,
        "name_en": "Bahrain",
        "name_ar": "البحرين",
    },
    GCCCountryCode.OM: {
        "oil_dependency": 0.60,
        "fiscal_buffer": 0.50,
        "trade_openness": 0.55,
        "diversification": 0.45,
        "private_sector_depth": 0.45,
        "startup_ecosystem": 0.30,
        "infrastructure_scale": 0.60,
        "name_en": "Oman",
        "name_ar": "عُمان",
    },
}


# ─── Signal-to-Public/Private Transmission ────────────────
PUBLIC_SIGNAL_WEIGHTS: dict[MacroSignalType, float] = {
    MacroSignalType.ENERGY_EXPOSURE: 0.85,
    MacroSignalType.REGULATORY_PRESSURE: 0.80,
    MacroSignalType.TRADE_RISK: 0.50,
    MacroSignalType.INFLATION_PRESSURE: 0.40,
    MacroSignalType.CONFIDENCE_PRESSURE: 0.35,
    MacroSignalType.FINANCING_SENSITIVITY: 0.30,
    MacroSignalType.SHIPPING_PRESSURE: 0.30,
    MacroSignalType.DEMAND_PRESSURE: 0.20,
}

PRIVATE_SIGNAL_WEIGHTS: dict[MacroSignalType, float] = {
    MacroSignalType.FINANCING_SENSITIVITY: 0.85,
    MacroSignalType.DEMAND_PRESSURE: 0.80,
    MacroSignalType.CONFIDENCE_PRESSURE: 0.75,
    MacroSignalType.INFLATION_PRESSURE: 0.70,
    MacroSignalType.TRADE_RISK: 0.60,
    MacroSignalType.SHIPPING_PRESSURE: 0.55,
    MacroSignalType.ENERGY_EXPOSURE: 0.40,
    MacroSignalType.REGULATORY_PRESSURE: 0.50,
}


def _clamp(v: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return round(max(lo, min(hi, v)), 1)


class CountryEngine:
    """
    Produces country-level intelligence with public/private sector split.
    Deterministic rules based on country structural profiles and macro signals.
    """

    def run(
        self,
        macro_signals: MacroSignalSet,
        gdp_impacts: list[GDPImpactResult],
        countries: list[GCCCountryCode],
    ) -> list[CountryImpact]:
        results = []
        gdp_map = {g.country_code: g for g in gdp_impacts}

        for country in countries:
            profile = COUNTRY_PROFILES[country]
            gdp = gdp_map.get(country)
            if not gdp:
                continue

            macro_sens = self._compute_macro_sensitivity(macro_signals, profile)
            public = self._compute_public_sector(macro_signals, profile, country)
            private = self._compute_private_sector(macro_signals, profile, country)
            risk = self._determine_risk_level(macro_sens, public, private)
            narrative = self._generate_narrative(country, profile, macro_sens, risk)
            confidence = round(min(0.65 + abs(gdp.aggregate_impact) * 0.3, 0.95), 3)

            results.append(CountryImpact(
                country_code=country,
                macro_sensitivity=macro_sens,
                gdp_impact=gdp,
                public_sector=public,
                private_sector=private,
                risk_level=risk,
                narrative=narrative,
                confidence=confidence,
            ))

        return sorted(results, key=lambda c: c.macro_sensitivity, reverse=True)

    def _compute_macro_sensitivity(self, signals: MacroSignalSet, profile: dict) -> float:
        """Overall macro sensitivity score (0–100)."""
        base = signals.overall_stress
        # Adjust by structural factors
        trade_adj = profile["trade_openness"] * 10
        buffer_adj = profile["fiscal_buffer"] * -8  # buffers reduce sensitivity
        oil_adj = profile["oil_dependency"] * 6
        return _clamp(base + trade_adj + buffer_adj + oil_adj)

    def _compute_public_sector(
        self, signals: MacroSignalSet, profile: dict, country: GCCCountryCode
    ) -> PublicSectorImpact:
        """Public sector impact: spending, policy, infrastructure, regulatory."""
        signal_pressure = sum(
            abs(s.magnitude) * PUBLIC_SIGNAL_WEIGHTS.get(s.type, 0.3) * 100
            for s in signals.signals
        ) / max(len(signals.signals), 1)

        fiscal = profile["fiscal_buffer"]
        infra = profile["infrastructure_scale"]
        oil = profile["oil_dependency"]

        spending = _clamp(signal_pressure * (1.0 + oil * 0.3) * (1.0 - fiscal * 0.2))
        policy = _clamp(signal_pressure * 0.8 + oil * 15)
        infrastructure = _clamp(infra * 50 + signal_pressure * 0.4)
        regulatory = _clamp(signal_pressure * 0.6 + 20)

        name = profile["name_en"]
        return PublicSectorImpact(
            spending_pressure=spending,
            policy_sensitivity=policy,
            infrastructure_continuity=infrastructure,
            regulatory_sensitivity=regulatory,
            strategic_priorities=self._get_public_priorities(profile),
            explanation=LanguageVariant(
                en=f"{name} public sector shows {'elevated' if spending > 60 else 'moderate'} spending pressure with {'strong' if fiscal > 0.7 else 'limited'} fiscal buffers.",
                ar=f"يُظهر القطاع العام في {profile['name_ar']} ضغوط إنفاق {'مرتفعة' if spending > 60 else 'معتدلة'} مع احتياطيات مالية {'قوية' if fiscal > 0.7 else 'محدودة'}.",
            ),
        )

    def _compute_private_sector(
        self, signals: MacroSignalSet, profile: dict, country: GCCCountryCode
    ) -> PrivateSectorImpact:
        """Private sector impact: operating costs, financing, demand, sentiment, startups."""
        signal_pressure = sum(
            abs(s.magnitude) * PRIVATE_SIGNAL_WEIGHTS.get(s.type, 0.3) * 100
            for s in signals.signals
        ) / max(len(signals.signals), 1)

        depth = profile["private_sector_depth"]
        startup = profile["startup_ecosystem"]
        trade = profile["trade_openness"]

        operating = _clamp(signal_pressure * (1.0 + trade * 0.3))
        financing = _clamp(signal_pressure * 0.9 + (1 - depth) * 15)
        demand = _clamp(signal_pressure * 0.8 + trade * 10)
        investment = _clamp(signal_pressure * 0.7 + (1 - depth) * 10)
        startup_sens = _clamp(signal_pressure * 0.85 + (1 - startup) * 20)

        name = profile["name_en"]
        return PrivateSectorImpact(
            operating_cost_pressure=operating,
            financing_pressure=financing,
            demand_pressure=demand,
            investment_sentiment=investment,
            startup_sensitivity=startup_sens,
            explanation=LanguageVariant(
                en=f"{name} private sector faces {'elevated' if operating > 60 else 'moderate'} operating pressure with {'deep' if depth > 0.6 else 'developing'} market structure.",
                ar=f"يواجه القطاع الخاص في {profile['name_ar']} ضغوط تشغيلية {'مرتفعة' if operating > 60 else 'معتدلة'} مع بنية سوقية {'عميقة' if depth > 0.6 else 'نامية'}.",
            ),
        )

    def _determine_risk_level(
        self, macro: float, public: PublicSectorImpact, private: PrivateSectorImpact
    ) -> str:
        avg_pressure = (
            macro * 0.3
            + public.spending_pressure * 0.2
            + private.operating_cost_pressure * 0.2
            + private.financing_pressure * 0.15
            + private.demand_pressure * 0.15
        )
        if avg_pressure >= 75:
            return "critical"
        elif avg_pressure >= 60:
            return "high"
        elif avg_pressure >= 45:
            return "elevated"
        elif avg_pressure >= 30:
            return "moderate"
        return "stable"

    def _get_public_priorities(self, profile: dict) -> list[str]:
        priorities = []
        if profile["infrastructure_scale"] > 0.7:
            priorities.append("Infrastructure continuity")
        if profile["oil_dependency"] > 0.6:
            priorities.append("Revenue diversification")
        if profile["fiscal_buffer"] > 0.7:
            priorities.append("Strategic reserve management")
        priorities.append("Regulatory stability")
        return priorities[:4]

    def _generate_narrative(
        self, country: GCCCountryCode, profile: dict, macro: float, risk: str
    ) -> LanguageVariant:
        name_en = profile["name_en"]
        name_ar = profile["name_ar"]
        return LanguageVariant(
            en=f"{name_en} macro sensitivity is at {macro:.0f}, risk level {risk}. "
               f"{'Oil-linked resilience provides fiscal buffers' if profile['oil_dependency'] > 0.6 else 'Diversified structure moderates direct exposure'}, "
               f"but private-sector transmission channels remain active in trade, financing, and demand.",
            ar=f"حساسية {name_ar} الاقتصادية عند {macro:.0f}، مستوى المخاطر {risk}. "
               f"{'المرونة المرتبطة بالنفط توفر احتياطيات مالية' if profile['oil_dependency'] > 0.6 else 'الهيكل المتنوع يخفف من التعرض المباشر'}، "
               f"لكن قنوات الانتقال في القطاع الخاص تبقى نشطة في التجارة والتمويل والطلب.",
        )
