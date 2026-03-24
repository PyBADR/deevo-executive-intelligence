"use client";

/**
 * NarrativePanel — Executive intelligence briefing.
 *
 * Visual Design:
 *   - Structured like a classified briefing document
 *   - Gold accent section dividers
 *   - Strong typographic hierarchy
 *   - Four sections: What / Why / Action / Signals
 *   - Composite + Risk scores in header bar
 *
 * This is the panel you read aloud to the Minister of Finance.
 *
 * Data: snapshot.narrative, snapshot.risk_register.explanation,
 *       snapshot.kpi_dashboard.headline, snapshot.decisions (immediate)
 */

import type { ExecutiveSnapshot } from "@/lib/api/client";

interface NarrativePanelProps {
  snapshot: ExecutiveSnapshot | null;
  loading?: boolean;
}

function scoreColor(v: number): string {
  return v >= 60 ? "text-red-400" : v >= 40 ? "text-yellow-400" : "text-emerald-400";
}

export function NarrativePanel({ snapshot, loading }: NarrativePanelProps) {
  if (loading) {
    return <div className="h-56 rounded-2xl shimmer" />;
  }

  if (!snapshot) {
    return (
      <div className="exec-card rounded-2xl p-10 text-center">
        <div className="text-sm text-deevo-text-muted">
          Executive brief appears when intelligence data is available.
        </div>
      </div>
    );
  }

  const narrative = snapshot.narrative;
  const riskExplanation = snapshot.risk_register?.explanation?.en;
  const kpiHeadline = snapshot.kpi_dashboard?.headline?.en;
  const immediateDecisions = snapshot.decisions?.filter(
    (d) => d.recommendation.priority === "immediate"
  ) || [];
  const overallScore = snapshot.scores?.overall_score;
  const riskScore = snapshot.risk_register?.aggregate_risk_score;
  const confidence = snapshot.scores?.confidence;

  return (
    <div className="exec-card rounded-2xl overflow-hidden fade-in-up">
      {/* Header bar — document title + metrics */}
      <div className="px-7 py-4 bg-deevo-elevated/60 border-b border-deevo-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-deevo-gold rounded-full" />
          <div>
            <h2 className="text-sm font-semibold text-deevo-text-primary tracking-tight">
              Executive Intelligence Brief
            </h2>
            <span className="text-[10px] text-deevo-text-muted">
              Sovereign-Grade Assessment · Deevo Analytics
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6 text-[11px]">
          {overallScore !== undefined && (
            <div className="text-right">
              <div className={`text-metric tabular-nums ${scoreColor(overallScore)}`}>
                {overallScore.toFixed(1)}
              </div>
              <div className="text-label text-deevo-text-muted mt-0.5">Composite</div>
            </div>
          )}
          {riskScore !== undefined && (
            <div className="text-right">
              <div className={`text-metric tabular-nums ${scoreColor(riskScore)}`}>
                {riskScore.toFixed(1)}
              </div>
              <div className="text-label text-deevo-text-muted mt-0.5">Risk</div>
            </div>
          )}
          {confidence !== undefined && (
            <div className="text-right">
              <div className="text-metric tabular-nums text-deevo-text-secondary">
                {(confidence * 100).toFixed(0)}%
              </div>
              <div className="text-label text-deevo-text-muted mt-0.5">Confidence</div>
            </div>
          )}
        </div>
      </div>

      {/* Briefing body */}
      <div className="p-7 space-y-6">
        {/* WHAT IS HAPPENING */}
        {narrative?.title?.en && (
          <BriefingSection label="What Is Happening">
            <p className="text-[15px] font-medium text-deevo-text-primary leading-relaxed">
              {narrative.title.en}
            </p>
            {narrative.body?.en && (
              <p className="text-[13px] text-deevo-text-secondary mt-3 leading-relaxed">
                {narrative.body.en}
              </p>
            )}
          </BriefingSection>
        )}

        {/* WHY IT MATTERS */}
        {(riskExplanation || kpiHeadline) && (
          <BriefingSection label="Why It Matters">
            {kpiHeadline && (
              <p className="text-[13px] text-deevo-text-secondary leading-relaxed">
                {kpiHeadline}
              </p>
            )}
            {riskExplanation && (
              <p className="text-[13px] text-deevo-text-secondary leading-relaxed mt-2">
                {riskExplanation}
              </p>
            )}
          </BriefingSection>
        )}

        {/* RECOMMENDED ACTIONS */}
        {immediateDecisions.length > 0 && (
          <BriefingSection label="Recommended Actions">
            <div className="space-y-3">
              {immediateDecisions.map((d, i) => (
                <div key={d.recommendation.id || i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-[13px] font-medium text-deevo-text-primary">
                      {d.recommendation.title.en}
                    </div>
                    {d.recommendation.action?.en && (
                      <div className="text-xs text-deevo-accent mt-0.5">
                        {d.recommendation.action.en}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </BriefingSection>
        )}

        {/* KEY SIGNALS */}
        {narrative?.key_points && narrative.key_points.length > 0 && (
          <BriefingSection label="Key Signals">
            <div className="space-y-2">
              {narrative.key_points.map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-deevo-gold mt-1.5" />
                  <span className="text-[13px] text-deevo-text-secondary leading-relaxed">
                    {point.en}
                  </span>
                </div>
              ))}
            </div>
          </BriefingSection>
        )}
      </div>
    </div>
  );
}

function BriefingSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="briefing-section">
      <div className="section-header-gold mb-3">{label}</div>
      {children}
    </div>
  );
}
