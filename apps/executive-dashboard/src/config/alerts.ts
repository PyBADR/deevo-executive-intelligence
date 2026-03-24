/**
 * Alert System Configuration — Threshold-based intelligence triggers.
 *
 * Every threshold maps to real pipeline output fields.
 * No fabricated metrics. No decorative alerts.
 */

export interface AlertThreshold {
  id: string;
  name: string;
  nameAr: string;
  field: string;             // dot-path to the field in pipeline output
  operator: ">" | ">=" | "<" | "<=" | "==";
  value: number;
  severity: "critical" | "high" | "medium" | "low";
  category: "decision" | "sector" | "country" | "risk" | "macro";
  message: string;
  messageAr: string;
}

export const ALERT_THRESHOLDS: AlertThreshold[] = [
  // ── Decision Urgency Alerts ───────────────────────────────
  {
    id: "alert_decision_pressure",
    name: "Decision Pressure Critical",
    nameAr: "ضغط القرار حرج",
    field: "scores.sub_scores.decision.score",
    operator: ">=",
    value: 70,
    severity: "critical",
    category: "decision",
    message: "Decision pressure exceeds critical threshold. Immediate executive action required.",
    messageAr: "ضغط القرار يتجاوز الحد الحرج. مطلوب إجراء تنفيذي فوري.",
  },
  {
    id: "alert_decision_elevated",
    name: "Decision Pressure Elevated",
    nameAr: "ضغط القرار مرتفع",
    field: "scores.sub_scores.decision.score",
    operator: ">=",
    value: 50,
    severity: "high",
    category: "decision",
    message: "Decision pressure elevated. Review recommended within 24 hours.",
    messageAr: "ضغط القرار مرتفع. يُنصح بالمراجعة خلال 24 ساعة.",
  },

  // ── Sector Risk Alerts ────────────────────────────────────
  {
    id: "alert_tier1_critical",
    name: "Tier 1 Sovereign Sector Under Stress",
    nameAr: "قطاع سيادي من المستوى الأول تحت ضغط",
    field: "sector_exposures.tier_summary.CRITICAL_SOVEREIGN",
    operator: ">=",
    value: 60,
    severity: "critical",
    category: "sector",
    message: "Tier 1 sovereign sector exposure exceeds 60. Critical infrastructure at risk.",
    messageAr: "تعرض القطاع السيادي من المستوى الأول يتجاوز 60. بنية تحتية حرجة معرضة للخطر.",
  },
  {
    id: "alert_sector_exposure_high",
    name: "High Sector Exposure Detected",
    nameAr: "تعرض قطاعي مرتفع",
    field: "sector_exposures.max_exposure",
    operator: ">=",
    value: 55,
    severity: "high",
    category: "sector",
    message: "One or more sectors showing exposure above 55. Monitor propagation.",
    messageAr: "قطاع أو أكثر يُظهر تعرضاً أعلى من 55. مراقبة الانتشار.",
  },

  // ── Country Instability Alerts ────────────────────────────
  {
    id: "alert_country_critical",
    name: "Country Risk Level Critical",
    nameAr: "مستوى مخاطر الدولة حرج",
    field: "country_impacts.max_sensitivity",
    operator: ">=",
    value: 65,
    severity: "critical",
    category: "country",
    message: "At least one GCC country shows critical macro sensitivity. Cross-border spillover likely.",
    messageAr: "دولة خليجية واحدة على الأقل تُظهر حساسية اقتصادية حرجة. احتمال انتقال عبر الحدود.",
  },
  {
    id: "alert_country_elevated",
    name: "Country Sensitivity Elevated",
    nameAr: "حساسية الدولة مرتفعة",
    field: "country_impacts.max_sensitivity",
    operator: ">=",
    value: 50,
    severity: "high",
    category: "country",
    message: "Country macro sensitivity elevated. Review private sector exposure.",
    messageAr: "حساسية الدولة الاقتصادية مرتفعة. مراجعة تعرض القطاع الخاص.",
  },

  // ── Risk Register Alerts ──────────────────────────────────
  {
    id: "alert_aggregate_risk_critical",
    name: "Aggregate Risk Critical",
    nameAr: "المخاطر الإجمالية حرجة",
    field: "risk_register.aggregate_risk_score",
    operator: ">=",
    value: 60,
    severity: "critical",
    category: "risk",
    message: "Aggregate risk score exceeds 60. Multiple risk vectors active.",
    messageAr: "درجة المخاطر الإجمالية تتجاوز 60. عدة مسارات مخاطر نشطة.",
  },
  {
    id: "alert_risk_critical_count",
    name: "Critical Risk Entries Detected",
    nameAr: "كشف مخاطر حرجة",
    field: "risk_register.critical_count",
    operator: ">=",
    value: 2,
    severity: "critical",
    category: "risk",
    message: "Two or more critical-severity risks identified. Escalate to leadership.",
    messageAr: "تم تحديد مخاطرتين أو أكثر بدرجة حرجة. تصعيد للقيادة.",
  },

  // ── Macro Stress Alerts ───────────────────────────────────
  {
    id: "alert_macro_stress_high",
    name: "Macro Stress Index High",
    nameAr: "مؤشر الإجهاد الكلي مرتفع",
    field: "macro_signals.overall_stress",
    operator: ">=",
    value: 60,
    severity: "high",
    category: "macro",
    message: "Overall macro stress exceeds 60. Economic transmission channels active.",
    messageAr: "الإجهاد الكلي يتجاوز 60. قنوات الانتقال الاقتصادي نشطة.",
  },
  {
    id: "alert_composite_score_critical",
    name: "Composite Intelligence Score Critical",
    nameAr: "درجة الذكاء المركبة حرجة",
    field: "scores.overall_score",
    operator: ">=",
    value: 70,
    severity: "critical",
    category: "macro",
    message: "Composite intelligence score exceeds 70. Full-spectrum economic impact detected.",
    messageAr: "درجة الذكاء المركبة تتجاوز 70. تأثير اقتصادي كامل الطيف.",
  },
];

export const SEVERITY_COLORS = {
  critical: "#ef4444",  // red-500
  high: "#f97316",      // orange-500
  medium: "#eab308",    // yellow-500
  low: "#22c55e",       // green-500
} as const;

export const SEVERITY_ORDER = ["critical", "high", "medium", "low"] as const;
