"""Seed scenario data for the intelligence pipeline."""
from ..schemas.scenario import (
    ScenarioInput, ScenarioCategory, ScenarioSeverity,
    GCCCountryCode, SectorCode, LanguageVariant,
)

SEED_SCENARIOS: list[ScenarioInput] = [
    ScenarioInput(
        id="scenario_001",
        title=LanguageVariant(
            en="Red Sea Shipping Disruption Escalation",
            ar="تصاعد اضطرابات الشحن في البحر الأحمر",
        ),
        description=LanguageVariant(
            en="Escalating disruption to Red Sea shipping corridors increases re-routing costs, delays cargo, raises maritime insurance premiums, and creates second-order inflation and trade pressure across the GCC.",
            ar="تصاعد الاضطرابات في ممرات الشحن بالبحر الأحمر يزيد تكاليف إعادة التوجيه ويؤخر الشحنات ويرفع أقساط التأمين البحري ويخلق ضغوط تضخمية وتجارية من الدرجة الثانية عبر دول الخليج.",
        ),
        category=ScenarioCategory.TRADE,
        severity=ScenarioSeverity.HIGH,
        affected_countries=list(GCCCountryCode),
        affected_sectors=[
            SectorCode.LOGISTICS, SectorCode.OIL_GAS, SectorCode.INSURANCE,
            SectorCode.BANKING, SectorCode.ECOMMERCE, SectorCode.PORTS_MARITIME,
            SectorCode.AVIATION,
        ],
        source_count=47,
        confidence=0.82,
        created_at="2026-03-24T00:00:00Z",
    ),
    ScenarioInput(
        id="scenario_002",
        title=LanguageVariant(
            en="OPEC+ Production Cut Extension",
            ar="تمديد خفض إنتاج أوبك+",
        ),
        description=LanguageVariant(
            en="OPEC+ extends production cuts beyond Q2, supporting oil prices but reducing export volumes and creating revenue concentration risk for hydrocarbon-dependent GCC economies.",
            ar="أوبك+ تمدد تخفيضات الإنتاج إلى ما بعد الربع الثاني، مما يدعم أسعار النفط لكنه يقلل أحجام التصدير ويخلق مخاطر تركز الإيرادات للاقتصادات الخليجية المعتمدة على الهيدروكربون.",
        ),
        category=ScenarioCategory.ENERGY,
        severity=ScenarioSeverity.MEDIUM,
        affected_countries=[GCCCountryCode.SA, GCCCountryCode.AE, GCCCountryCode.KW, GCCCountryCode.OM],
        affected_sectors=[
            SectorCode.OIL_GAS, SectorCode.BANKING, SectorCode.GOVERNMENT_FINANCE,
            SectorCode.ENERGY_INFRASTRUCTURE, SectorCode.SOVEREIGN_WEALTH,
        ],
        source_count=38,
        confidence=0.78,
        created_at="2026-03-23T00:00:00Z",
    ),
    ScenarioInput(
        id="scenario_003",
        title=LanguageVariant(
            en="Saudi Giga-Project Acceleration",
            ar="تسريع المشاريع العملاقة السعودية",
        ),
        description=LanguageVariant(
            en="Saudi Arabia accelerates NEOM, The Line, and Red Sea Project timelines, increasing infrastructure spending, contractor demand, and cross-sector investment flows.",
            ar="المملكة العربية السعودية تسرّع الجداول الزمنية لنيوم والخط ومشروع البحر الأحمر، مما يزيد الإنفاق على البنية التحتية وطلب المقاولين وتدفقات الاستثمار عبر القطاعات.",
        ),
        category=ScenarioCategory.INFRASTRUCTURE,
        severity=ScenarioSeverity.MEDIUM,
        affected_countries=[GCCCountryCode.SA, GCCCountryCode.AE, GCCCountryCode.BH],
        affected_sectors=[
            SectorCode.CONSTRUCTION, SectorCode.BANKING, SectorCode.AI_TECHNOLOGY,
            SectorCode.LOGISTICS, SectorCode.MANUFACTURING,
        ],
        source_count=29,
        confidence=0.75,
        created_at="2026-03-22T00:00:00Z",
    ),
    ScenarioInput(
        id="scenario_004",
        title=LanguageVariant(
            en="GCC-wide Food Import Inflation Pressure",
            ar="ضغوط تضخم واردات الغذاء على مستوى الخليج",
        ),
        description=LanguageVariant(
            en="Rising global food and commodity prices combined with currency dynamics create consumer inflation pressure across all GCC countries, impacting household consumption and retail sectors.",
            ar="ارتفاع أسعار الغذاء والسلع العالمية مع ديناميكيات العملة يخلق ضغوط تضخمية على المستهلك عبر جميع دول الخليج، مما يؤثر على الاستهلاك الأسري وقطاع التجزئة.",
        ),
        category=ScenarioCategory.DEMAND,
        severity=ScenarioSeverity.HIGH,
        affected_countries=list(GCCCountryCode),
        affected_sectors=[
            SectorCode.RETAIL, SectorCode.ECOMMERCE, SectorCode.BANKING,
            SectorCode.INSURANCE, SectorCode.LOGISTICS,
        ],
        source_count=34,
        confidence=0.80,
        created_at="2026-03-21T00:00:00Z",
    ),
    ScenarioInput(
        id="scenario_005",
        title=LanguageVariant(
            en="UAE Digital Economy Regulatory Push",
            ar="الدفع التنظيمي للاقتصاد الرقمي في الإمارات",
        ),
        description=LanguageVariant(
            en="UAE announces accelerated regulatory frameworks for digital assets, AI governance, and fintech licensing, creating both opportunity and compliance pressure across the technology ecosystem.",
            ar="الإمارات تعلن عن أطر تنظيمية متسارعة للأصول الرقمية وحوكمة الذكاء الاصطناعي وترخيص التقنية المالية، مما يخلق فرصاً وضغوط امتثال عبر منظومة التكنولوجيا.",
        ),
        category=ScenarioCategory.REGULATORY,
        severity=ScenarioSeverity.MEDIUM,
        affected_countries=[GCCCountryCode.AE, GCCCountryCode.BH, GCCCountryCode.SA],
        affected_sectors=[
            SectorCode.FINTECH, SectorCode.AI_TECHNOLOGY, SectorCode.BANKING,
            SectorCode.ECOMMERCE, SectorCode.CYBERSECURITY,
        ],
        source_count=22,
        confidence=0.72,
        created_at="2026-03-20T00:00:00Z",
    ),
]
