"use client";

/**
 * Decision Card — Prioritized intelligence recommendation.
 *
 * Maps to: ExplainedDecision from /decisions or /snapshot/executive
 * Every field traces to a real pipeline output.
 */

interface DecisionCardProps {
  title: { en: string; ar: string };
  action: { en: string; ar: string };
  urgency: "immediate" | "short_term" | "medium_term" | "long_term";
  pressureScore: number;
  whatHappened: string;
  whyItMatters: string;
  whoIsAffected: string[];
  whyThisRecommendation: string;
  confidence: number;
}

const URGENCY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  immediate: { bg: "bg-red-500/10", text: "text-red-400", label: "IMMEDIATE" },
  short_term: { bg: "bg-orange-500/10", text: "text-orange-400", label: "SHORT TERM" },
  medium_term: { bg: "bg-yellow-500/10", text: "text-yellow-400", label: "MEDIUM TERM" },
  long_term: { bg: "bg-blue-500/10", text: "text-blue-400", label: "LONG TERM" },
};

export function DecisionCard({
  title,
  action,
  urgency,
  pressureScore,
  whatHappened,
  whyItMatters,
  whoIsAffected,
  whyThisRecommendation,
  confidence,
}: DecisionCardProps) {
  const style = URGENCY_STYLES[urgency] || URGENCY_STYLES.medium_term;

  return (
    <div className="exec-card rounded-xl bg-deevo-surface p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${style.bg} ${style.text}`}>
          {style.label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-deevo-text-muted">Pressure</span>
          <span className={`text-sm font-mono font-semibold ${
            pressureScore >= 60 ? "text-red-400" : pressureScore >= 40 ? "text-yellow-400" : "text-emerald-400"
          }`}>
            {pressureScore.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold mb-2 leading-snug">{title.en}</h3>

      {/* Action */}
      <p className="text-sm text-deevo-accent mb-4">{action.en}</p>

      {/* Explanation Chain */}
      <div className="space-y-3 text-xs text-deevo-text-secondary">
        <ExplanationRow label="What happened" value={whatHappened} />
        <ExplanationRow label="Why it matters" value={whyItMatters} />
        <ExplanationRow label="Recommendation" value={whyThisRecommendation} />
      </div>

      {/* Affected Entities */}
      {whoIsAffected.length > 0 && (
        <div className="mt-4 pt-3 border-t border-deevo-border">
          <div className="text-[10px] text-deevo-text-muted uppercase tracking-wider mb-2">Affected</div>
          <div className="flex flex-wrap gap-1.5">
            {whoIsAffected.map((e) => (
              <span key={e} className="text-xs px-1.5 py-0.5 bg-deevo-elevated rounded text-deevo-text-secondary">
                {e}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Confidence */}
      <div className="mt-3 text-[10px] text-deevo-text-muted text-right">
        Confidence: {(confidence * 100).toFixed(0)}%
      </div>
    </div>
  );
}

function ExplanationRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-deevo-text-muted font-medium">{label}: </span>
      <span>{value}</span>
    </div>
  );
}
