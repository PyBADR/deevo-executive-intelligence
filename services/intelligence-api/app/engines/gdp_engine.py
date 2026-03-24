"""
GDP Propagation Engine — Maps macro signals to GDP component impacts.

Deterministic, explainable, rule-based. Every GDP component impact
includes direction, drivers, and bilingual explanation.
"""
from ..schemas.scenario import GCCCountryCode, GDPComponentCode, LanguageVariant
from ..schemas.macro import MacroSignalSet, MacroSignalType
from ..schemas.gdp import GDPComponentImpact, GDPImpactResult


# ─── Signal-to-GDP Transmission Rules ─────────────────────
# Each macro signal type affects GDP components with specific weights.
# Weights represent transmission strength (0–1).
SIGNAL_GDP_TRANSMISSION: dict[MacroSignalType, dict[GDPComponentCode, float]] = {
    MacroSignalType.TRADE_RISK: {
        GDPComponentCode.NET_EXPORTS: 0.90,
        GDPComponentCode.BUSINESS_INVESTMENT: 0.50,
        GDPComponentCode.HOUSEHOLD_CONSUMPTION: 0.30,
        GDPComponentCode.GOVERNMENT_SPENDING: 0.15,
    },
    MacroSignalType.SHIPPING_PRESSURE: {
        GDPComponentCode.NET_EXPORTS: 0.85,
        GDPComponentCode.HOUSEHOLD_CONSUMPTION: 0.40,
        GDPComponentCode.BUSINESS_INVESTMENT: 0.35,
        GDPComponentCode.GOVERNMENT_SPENDING: 0.10,
    },
    MacroSignalType.INFLATION_PRESSURE: {
        GDPComponentCode.HOUSEHOLD_CONSUMPTION: 0.85,
        GDPComponentCode.BUSINESS_INVESTMENT: 0.45,
        GDPComponentCode.NET_EXPORTS: 0.30,
        GDPComponentCode.GOVERNMENT_SPENDING: 0.25,
    },
    MacroSignalType.CONFIDENCE_PRESSURE: {
        GDPComponentCode.BUSINESS_INVESTMENT: 0.80,
        GDPComponentCode.HOUSEHOLD_CONSUMPTION: 0.60,
        GDPComponentCode.NET_EXPORTS: 0.25,
        GDPComponentCode.GOVERNMENT_SPENDING: 0.20,
    },
    MacroSignalType.ENERGY_EXPOSURE: {
        GDPComponentCode.NET_EXPORTS: 0.80,
        GDPComponentCode.GOVERNMENT_SPENDING: 0.70,
        GDPComponentCode.BUSINESS_INVESTMENT: 0.40,
        GDPComponentCode.HOUSEHOLD_CONSUMPTION: 0.25,
    },
    MacroSignalType.FINANCING_SENSITIVITY: {
        GDPComponentCode.BUSINESS_INVESTMENT: 0.85,
        GDPComponentCode.HOUSEHOLD_CONSUMPTION: 0.40,
        GDPComponentCode.GOVERNMENT_SPENDING: 0.30,
        GDPComponentCode.NET_EXPORTS: 0.20,
    },
    MacroSignalType.DEMAND_PRESSURE: {
        GDPComponentCode.HOUSEHOLD_CONSUMPTION: 0.90,
        GDPComponentCode.BUSINESS_INVESTMENT: 0.55,
        GDPComponentCode.NET_EXPORTS: 0.35,
        GDPComponentCode.GOVERNMENT_SPENDING: 0.15,
    },
    MacroSignalType.REGULATORY_PRESSURE: {
        GDPComponentCode.BUSINESS_INVESTMENT: 0.65,
        GDPComponentCode.GOVERNMENT_SPENDING: 0.50,
        GDPComponentCode.HOUSEHOLD_CONSUMPTION: 0.20,
        GDPComponentCode.NET_EXPORTS: 0.25,
    },
}

# ─── Country GDP Sensitivity Profiles ─────────────────────
# Each GCC country has different sensitivity to GDP components.
# Higher value = more sensitive to shocks in that component.
COUNTRY_GDP_SENSITIVITY: dict[GCCCountryCode, dict[GDPComponentCode, float]] = {
    GCCCountryCode.SA: {
        GDPComponentCode.NET_EXPORTS: 0.85,
        GDPComponentCode.GOVERNMENT_SPENDING: 0.80,
        GDPComponentCode.BUSINESS_INVESTMENT: 0.70,
        GDPComponentCode.HOUSEHOLD_CONSUMPTION: 0.55,
    },
    GCCCountryCode.AE: {
        GDPComponentCode.NET_EXPORTS: 0.80,
        GDPComponentCode.BUSINESS_INVESTMENT: 0.85,
        GDPComponentCode.HOUSEHOLD_CONSUMPTION: 0.65,
        GDPComponentCode.GOVERNMENT_SPENDING: 0.55,
    },
    GCCCountryCode.KW: {
        GDPComponentCode.NET_EXPORTS: 0.90,
        GDPComponentCode.GOVERNMENT_SPENDING: 0.85,
        GDPComponentCode.BUSINESS_INVESTMENT: 0.50,
        GDPComponentCode.HOUSEHOLD_CONSUMPTION: 0.45,
    },
    GCCCountryCode.QA: {
        GDPComponentCode.NET_EXPORTS: 0.90,
        GDPComponentCode.GOVERNMENT_SPENDING: 0.70,
        GDPComponentCode.BUSINESS_INVESTMENT: 0.65,
        GDPComponentCode.HOUSEHOLD_CONSUMPTION: 0.50,
    },
    GCCCountryCode.BH: {
        GDPComponentCode.BUSINESS_INVESTMENT: 0.75,
        GDPComponentCode.HOUSEHOLD_CONSUMPTION: 0.70,
        GDPComponentCode.NET_EXPORTS: 0.60,
        GDPComponentCode.GOVERNMENT_SPENDING: 0.65,
    },
    GCCCountryCode.OM: {
        GDPComponentCode.NET_EXPORTS: 0.80,
        GDPComponentCode.GOVERNMENT_SPENDING: 0.75,
        GDPComponentCode.BUSINESS_INVESTMENT: 0.55,
        GDPComponentCode.HOUSEHOLD_CONSUMPTION: 0.50,
    },
}

# ─── GDP Component Explanations ───────────────────────────
GDP_EXPLANATIONS: dict[GDPComponentCode, dict[str, str]] = {
    GDPComponentCode.HOUSEHOLD_CONSUMPTION: {
        "en": "Household consumption is pressured by cost pass-through, confidence erosion, and discretionary spending contraction.",
        "ar": "يتعرض الاستهلاك الأسري لضغوط من انتقال التكاليف وتآكل الثقة وانكماش الإنفاق الاستهلاكي.",
    },
    GDPComponentCode.BUSINESS_INVESTMENT: {
        "en": "Private investment faces headwinds from financing tightness, demand uncertainty, and cross-border hesitation.",
        "ar": "يواجه الاستثمار الخاص رياحاً معاكسة من ضيق التمويل وعدم اليقين في الطلب والتردد العابر للحدود.",
    },
    GDPComponentCode.GOVERNMENT_SPENDING: {
        "en": "Government spending reflects fiscal capacity, revenue sensitivity, and strategic prioritization under pressure.",
        "ar": "يعكس الإنفاق الحكومي القدرة المالية وحساسية الإيرادات والأولويات الاستراتيجية تحت الضغط.",
    },
    GDPComponentCode.NET_EXPORTS: {
        "en": "Net exports are driven by trade route reliability, energy price dynamics, and cross-border demand conditions.",
        "ar": "يتأثر صافي الصادرات بموثوقية المسارات التجارية وديناميكيات أسعار الطاقة وظروف الطلب العابر للحدود.",
    },
}


class GDPEngine:
    """
    Deterministic GDP propagation engine.

    Takes macro signals → produces per-country GDP component impacts
    with scores, directions, drivers, and explanations.
    """

    def run(
        self,
        macro_signals: MacroSignalSet,
        countries: list[GCCCountryCode],
    ) -> list[GDPImpactResult]:
        """Propagate macro signals into GDP impacts for each country."""
        results = []
        for country in countries:
            components = self._compute_country_gdp(macro_signals, country)
            agg = self._aggregate_impact(components)
            results.append(GDPImpactResult(
                scenario_id=macro_signals.scenario_id,
                country_code=country,
                components=components,
                aggregate_impact=round(agg, 3),
                explanation=LanguageVariant(
                    en=f"Aggregate GDP impact for {country.value}: {round(agg * 100, 1)}% pressure across {len(components)} components.",
                    ar=f"التأثير الإجمالي على الناتج المحلي لـ {country.value}: ضغط {round(abs(agg) * 100, 1)}% عبر {len(components)} مكونات.",
                ),
            ))
        return results

    def _compute_country_gdp(
        self,
        macro_signals: MacroSignalSet,
        country: GCCCountryCode,
    ) -> list[GDPComponentImpact]:
        """Compute GDP component impacts for a single country."""
        country_sensitivity = COUNTRY_GDP_SENSITIVITY.get(country, {})
        component_scores: dict[GDPComponentCode, float] = {c: 0.0 for c in GDPComponentCode}
        component_drivers: dict[GDPComponentCode, set] = {c: set() for c in GDPComponentCode}

        for signal in macro_signals.signals:
            transmission = SIGNAL_GDP_TRANSMISSION.get(signal.type, {})
            for comp_code, tx_weight in transmission.items():
                country_mult = country_sensitivity.get(comp_code, 0.5)
                impact = signal.magnitude * tx_weight * country_mult
                component_scores[comp_code] += impact
                if abs(impact) > 0.05:
                    component_drivers[comp_code].add(signal.type.value)

        results = []
        for comp_code in GDPComponentCode:
            raw_score = component_scores[comp_code]
            # Clamp to [-1, 1]
            clamped = max(-1.0, min(1.0, raw_score))
            direction = "negative" if clamped < -0.05 else ("positive" if clamped > 0.05 else "neutral")
            exp = GDP_EXPLANATIONS.get(comp_code, {"en": "", "ar": ""})

            results.append(GDPComponentImpact(
                component=comp_code,
                impact_score=round(clamped, 3),
                direction=direction,
                confidence=round(min(0.6 + abs(clamped) * 0.4, 1.0), 3),
                drivers=list(component_drivers[comp_code]),
                explanation=LanguageVariant(en=exp["en"], ar=exp["ar"]),
            ))

        return sorted(results, key=lambda x: x.impact_score)

    def _aggregate_impact(self, components: list[GDPComponentImpact]) -> float:
        """Weighted average of component impacts (GDP share-weighted)."""
        weights = {
            GDPComponentCode.HOUSEHOLD_CONSUMPTION: 0.35,
            GDPComponentCode.BUSINESS_INVESTMENT: 0.25,
            GDPComponentCode.GOVERNMENT_SPENDING: 0.25,
            GDPComponentCode.NET_EXPORTS: 0.15,
        }
        total = sum(c.impact_score * weights.get(c.component, 0.25) for c in components)
        return total
