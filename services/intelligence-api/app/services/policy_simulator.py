"""
Policy Impact Simulator — Deterministic policy-to-economic impact modeling.

Chain: policy → macro signals → GDP → public/private → sectors → decisions.
"""
from pydantic import BaseModel, Field
from enum import Enum
from ..schemas.scenario import (
    ScenarioInput, ScenarioCategory, ScenarioSeverity,
    GCCCountryCode, SectorCode, LanguageVariant,
)


class PolicyType(str, Enum):
    SUBSIDY = "subsidy"
    TAX = "tax"
    REGULATION = "regulation"
    RATE_CHANGE = "rate_change"
    EXPORT_CONTROL = "export_control"


class PolicyInput(BaseModel):
    policy_type: PolicyType
    magnitude: float = Field(ge=0, le=100, description="Policy intensity 0-100")
    target_sectors: list[SectorCode] = Field(default_factory=list)
    country: GCCCountryCode
    description: str = ""


class PolicySimulationOutput(BaseModel):
    generated_scenario: ScenarioInput
    impact_chain: list[str]
    explanation: LanguageVariant


# ─── Policy → Category Mapping ───────────────────────────
POLICY_CATEGORY_MAP = {
    PolicyType.SUBSIDY: ScenarioCategory.DEMAND,
    PolicyType.TAX: ScenarioCategory.FINANCIAL,
    PolicyType.REGULATION: ScenarioCategory.REGULATORY,
    PolicyType.RATE_CHANGE: ScenarioCategory.FINANCIAL,
    PolicyType.EXPORT_CONTROL: ScenarioCategory.TRADE,
}

POLICY_SEVERITY_THRESHOLDS = [(70, ScenarioSeverity.CRITICAL), (50, ScenarioSeverity.HIGH), (25, ScenarioSeverity.MEDIUM), (0, ScenarioSeverity.LOW)]


class PolicySimulator:
    """Simulates economic impact of policy changes through the intelligence pipeline."""

    def run(self, input: PolicyInput) -> PolicySimulationOutput:
        severity = ScenarioSeverity.LOW
        for threshold, sev in POLICY_SEVERITY_THRESHOLDS:
            if input.magnitude >= threshold:
                severity = sev
                break

        category = POLICY_CATEGORY_MAP.get(input.policy_type, ScenarioCategory.REGULATORY)
        sectors = input.target_sectors or [SectorCode.BANKING, SectorCode.GOVERNMENT_FINANCE]

        scenario = ScenarioInput(
            id=f"sim_policy_{input.policy_type.value}",
            title=LanguageVariant(
                en=f"Policy: {input.policy_type.value.replace('_', ' ').title()} ({input.magnitude:.0f}%)",
                ar=f"سياسة: {input.policy_type.value} ({input.magnitude:.0f}%)",
            ),
            description=LanguageVariant(
                en=f"{input.policy_type.value.replace('_', ' ').title()} policy at {input.magnitude:.0f}% magnitude "
                   f"targeting {input.country.value}. {input.description}",
                ar=f"سياسة {input.policy_type.value} بقوة {input.magnitude:.0f}% تستهدف {input.country.value}.",
            ),
            category=category,
            severity=severity,
            affected_countries=[input.country],
            affected_sectors=list(set(sectors)),
            source_count=1,
            confidence=0.85,
        )

        chain = [
            f"1. Policy: {input.policy_type.value} ({input.magnitude:.0f}%)",
            f"2. → Macro signal adjustment ({category.value} channel)",
            "3. → GDP component shifts",
            f"4. → {input.country.value} public/private sector impact",
            f"5. → Sector exposure changes ({', '.join(s.value for s in sectors[:3])})",
            "6. → Decision recommendations",
        ]

        return PolicySimulationOutput(
            generated_scenario=scenario,
            impact_chain=chain,
            explanation=LanguageVariant(
                en=f"Policy simulation: {input.policy_type.value} at {input.magnitude:.0f}% "
                   f"in {input.country.value}. Feed generated scenario into intelligence pipeline for full impact.",
                ar=f"محاكاة السياسة: {input.policy_type.value} بنسبة {input.magnitude:.0f}% في {input.country.value}.",
            ),
        )
