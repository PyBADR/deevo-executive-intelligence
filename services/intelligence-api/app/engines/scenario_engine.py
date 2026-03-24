"""
Scenario Engine — Converts raw scenario input into structured macro signals.

This is the FIRST stage of the intelligence pipeline.
It normalizes scenario events (trade disruption, energy shock, etc.) into
quantified macro-economic pressure signals with deterministic rules.
"""
from ..schemas.scenario import ScenarioInput, ScenarioCategory, ScenarioSeverity, LanguageVariant
from ..schemas.macro import MacroSignal, MacroSignalSet, MacroSignalType


# ─── Severity Multipliers ─────────────────────────────────
SEVERITY_MULTIPLIER = {
    ScenarioSeverity.CRITICAL: 1.0,
    ScenarioSeverity.HIGH: 0.8,
    ScenarioSeverity.MEDIUM: 0.55,
    ScenarioSeverity.LOW: 0.3,
}

# ─── Category-to-Signal Transmission Matrix ───────────────
# Each category has a deterministic mapping to macro signal types.
# Values represent base transmission strength (0–1).
CATEGORY_SIGNAL_MATRIX: dict[ScenarioCategory, dict[MacroSignalType, float]] = {
    ScenarioCategory.TRADE: {
        MacroSignalType.TRADE_RISK: 0.95,
        MacroSignalType.SHIPPING_PRESSURE: 0.85,
        MacroSignalType.INFLATION_PRESSURE: 0.60,
        MacroSignalType.ENERGY_EXPOSURE: 0.50,
        MacroSignalType.CONFIDENCE_PRESSURE: 0.45,
        MacroSignalType.FINANCING_SENSITIVITY: 0.35,
        MacroSignalType.DEMAND_PRESSURE: 0.40,
        MacroSignalType.REGULATORY_PRESSURE: 0.20,
    },
    ScenarioCategory.ENERGY: {
        MacroSignalType.ENERGY_EXPOSURE: 0.95,
        MacroSignalType.TRADE_RISK: 0.55,
        MacroSignalType.INFLATION_PRESSURE: 0.70,
        MacroSignalType.SHIPPING_PRESSURE: 0.45,
        MacroSignalType.CONFIDENCE_PRESSURE: 0.50,
        MacroSignalType.FINANCING_SENSITIVITY: 0.40,
        MacroSignalType.DEMAND_PRESSURE: 0.35,
        MacroSignalType.REGULATORY_PRESSURE: 0.30,
    },
    ScenarioCategory.GEOPOLITICAL: {
        MacroSignalType.CONFIDENCE_PRESSURE: 0.90,
        MacroSignalType.TRADE_RISK: 0.75,
        MacroSignalType.ENERGY_EXPOSURE: 0.65,
        MacroSignalType.SHIPPING_PRESSURE: 0.60,
        MacroSignalType.FINANCING_SENSITIVITY: 0.55,
        MacroSignalType.INFLATION_PRESSURE: 0.40,
        MacroSignalType.DEMAND_PRESSURE: 0.50,
        MacroSignalType.REGULATORY_PRESSURE: 0.45,
    },
    ScenarioCategory.FINANCIAL: {
        MacroSignalType.FINANCING_SENSITIVITY: 0.90,
        MacroSignalType.CONFIDENCE_PRESSURE: 0.80,
        MacroSignalType.DEMAND_PRESSURE: 0.60,
        MacroSignalType.INFLATION_PRESSURE: 0.45,
        MacroSignalType.TRADE_RISK: 0.30,
        MacroSignalType.ENERGY_EXPOSURE: 0.25,
        MacroSignalType.SHIPPING_PRESSURE: 0.20,
        MacroSignalType.REGULATORY_PRESSURE: 0.50,
    },
    ScenarioCategory.REGULATORY: {
        MacroSignalType.REGULATORY_PRESSURE: 0.95,
        MacroSignalType.CONFIDENCE_PRESSURE: 0.60,
        MacroSignalType.FINANCING_SENSITIVITY: 0.50,
        MacroSignalType.DEMAND_PRESSURE: 0.35,
        MacroSignalType.TRADE_RISK: 0.25,
        MacroSignalType.INFLATION_PRESSURE: 0.20,
        MacroSignalType.ENERGY_EXPOSURE: 0.15,
        MacroSignalType.SHIPPING_PRESSURE: 0.10,
    },
    ScenarioCategory.DEMAND: {
        MacroSignalType.DEMAND_PRESSURE: 0.90,
        MacroSignalType.CONFIDENCE_PRESSURE: 0.65,
        MacroSignalType.INFLATION_PRESSURE: 0.55,
        MacroSignalType.FINANCING_SENSITIVITY: 0.45,
        MacroSignalType.TRADE_RISK: 0.30,
        MacroSignalType.ENERGY_EXPOSURE: 0.20,
        MacroSignalType.SHIPPING_PRESSURE: 0.15,
        MacroSignalType.REGULATORY_PRESSURE: 0.25,
    },
    ScenarioCategory.INFRASTRUCTURE: {
        MacroSignalType.FINANCING_SENSITIVITY: 0.70,
        MacroSignalType.DEMAND_PRESSURE: 0.55,
        MacroSignalType.CONFIDENCE_PRESSURE: 0.50,
        MacroSignalType.INFLATION_PRESSURE: 0.45,
        MacroSignalType.REGULATORY_PRESSURE: 0.60,
        MacroSignalType.TRADE_RISK: 0.30,
        MacroSignalType.ENERGY_EXPOSURE: 0.35,
        MacroSignalType.SHIPPING_PRESSURE: 0.25,
    },
    ScenarioCategory.CONFIDENCE: {
        MacroSignalType.CONFIDENCE_PRESSURE: 0.95,
        MacroSignalType.FINANCING_SENSITIVITY: 0.75,
        MacroSignalType.DEMAND_PRESSURE: 0.65,
        MacroSignalType.TRADE_RISK: 0.40,
        MacroSignalType.INFLATION_PRESSURE: 0.30,
        MacroSignalType.ENERGY_EXPOSURE: 0.25,
        MacroSignalType.SHIPPING_PRESSURE: 0.20,
        MacroSignalType.REGULATORY_PRESSURE: 0.35,
    },
}

# ─── Signal Driver Descriptions ───────────────────────────
SIGNAL_DRIVERS: dict[MacroSignalType, dict[str, list[str]]] = {
    MacroSignalType.TRADE_RISK: {
        "drivers": ["corridor disruption", "tariff escalation", "sanctions exposure", "re-routing costs"],
        "en": "Trade route reliability and cross-border flow stability",
        "ar": "موثوقية المسارات التجارية واستقرار التدفقات العابرة للحدود",
    },
    MacroSignalType.SHIPPING_PRESSURE: {
        "drivers": ["port congestion", "freight rate spikes", "vessel re-routing", "insurance premiums"],
        "en": "Shipping logistics stress and maritime corridor dependency",
        "ar": "ضغوط اللوجستيات البحرية والاعتماد على الممرات الملاحية",
    },
    MacroSignalType.INFLATION_PRESSURE: {
        "drivers": ["import cost pass-through", "food price sensitivity", "energy cost transmission", "wage adjustment"],
        "en": "Consumer and producer price pressure from imported and structural costs",
        "ar": "ضغوط الأسعار على المستهلك والمنتج من التكاليف المستوردة والهيكلية",
    },
    MacroSignalType.CONFIDENCE_PRESSURE: {
        "drivers": ["investment hesitation", "consumer sentiment", "market volatility", "policy uncertainty"],
        "en": "Economic confidence and forward-looking sentiment degradation",
        "ar": "تراجع الثقة الاقتصادية والتوقعات المستقبلية",
    },
    MacroSignalType.ENERGY_EXPOSURE: {
        "drivers": ["oil price volatility", "production adjustments", "strategic reserve policy", "export dependency"],
        "en": "Energy market sensitivity and hydrocarbon revenue exposure",
        "ar": "حساسية سوق الطاقة والتعرض لإيرادات الهيدروكربون",
    },
    MacroSignalType.FINANCING_SENSITIVITY: {
        "drivers": ["credit tightening", "bond spread widening", "FDI hesitation", "liquidity conditions"],
        "en": "Capital market access, credit availability, and funding conditions",
        "ar": "الوصول إلى أسواق رأس المال وتوافر الائتمان وظروف التمويل",
    },
    MacroSignalType.DEMAND_PRESSURE: {
        "drivers": ["discretionary spending reduction", "B2B volume decline", "project deferrals", "consumption contraction"],
        "en": "Domestic and cross-border demand contraction indicators",
        "ar": "مؤشرات انكماش الطلب المحلي والعابر للحدود",
    },
    MacroSignalType.REGULATORY_PRESSURE: {
        "drivers": ["compliance costs", "licensing changes", "cross-border regulation", "policy shifts"],
        "en": "Regulatory burden and policy-driven operational adjustments",
        "ar": "العبء التنظيمي والتعديلات التشغيلية الناتجة عن السياسات",
    },
}


class ScenarioEngine:
    """
    Deterministic scenario-to-macro-signal engine.

    Takes a ScenarioInput → produces a MacroSignalSet with quantified,
    explained pressure signals across all macro dimensions.
    """

    def run(self, scenario: ScenarioInput) -> MacroSignalSet:
        """Process scenario and produce macro signals."""
        severity_mult = SEVERITY_MULTIPLIER[scenario.severity]
        signal_matrix = CATEGORY_SIGNAL_MATRIX.get(scenario.category, {})
        confidence_base = scenario.confidence

        signals: list[MacroSignal] = []
        for signal_type, base_strength in signal_matrix.items():
            magnitude = round(base_strength * severity_mult * -1, 3)  # negative = adverse
            confidence = round(min(confidence_base * (0.8 + base_strength * 0.2), 1.0), 3)

            info = SIGNAL_DRIVERS.get(signal_type, {"drivers": [], "en": "", "ar": ""})
            signals.append(MacroSignal(
                type=signal_type,
                magnitude=magnitude,
                confidence=confidence,
                drivers=info["drivers"],
                explanation=LanguageVariant(en=info["en"], ar=info["ar"]),
            ))

        # Overall stress: weighted average of absolute magnitudes × 100
        if signals:
            total_weight = sum(abs(s.magnitude) for s in signals)
            overall_stress = round((total_weight / len(signals)) * 100, 1)
        else:
            overall_stress = 0.0

        return MacroSignalSet(
            scenario_id=scenario.id,
            signals=sorted(signals, key=lambda s: s.magnitude),
            overall_stress=min(overall_stress, 100.0),
        )
