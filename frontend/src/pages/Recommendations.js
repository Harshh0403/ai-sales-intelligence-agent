import { Target, Clock, User, AlertCircle } from "lucide-react";

const PRIORITY_COLORS = { high: "#10b981", medium: "#eab308", low: "#6ee7b780" };

export default function Recommendations({ analysis }) {
  const recommendations = analysis?.recommendations || [];

  return (
    <div className="page-container" data-testid="recommendations-page">
      <div className="page-header">
        <h1 className="page-title">Recommendations</h1>
        <p className="page-subtitle">Actionable AI recommendations to close deals faster</p>
      </div>

      {!analysis ? (
        <div className="glass-card p-12 text-center" data-testid="no-recommendations">
          <Target className="w-10 h-10 text-emerald-500/30 mx-auto mb-4" />
          <p className="text-emerald-100/60 text-sm">Run AI Analysis from the Dashboard to generate recommendations</p>
        </div>
      ) : (
        <div className="space-y-4" data-testid="recommendations-list">
          {recommendations.map((rec, i) => (
            <div key={i} className="glass-card p-5 hover:border-emerald-500/30 transition-all group" data-testid={`recommendation-${i}`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${PRIORITY_COLORS[rec.priority]}15` }}>
                  <span className="text-lg font-bold font-mono" style={{ color: PRIORITY_COLORS[rec.priority] }}>
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`tag tag-${rec.priority === "high" ? "high" : rec.priority === "medium" ? "medium" : "low"}`}>
                      {rec.priority} priority
                    </span>
                    {rec.timeline && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-500/50">
                        <Clock className="w-3 h-3" /> {rec.timeline}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-emerald-100/90 font-medium mb-1">{rec.action}</p>
                  {rec.lead && (
                    <span className="flex items-center gap-1 text-xs text-emerald-500/60">
                      <User className="w-3 h-3" /> {rec.lead}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Risks from analysis */}
          {analysis.risks && analysis.risks.length > 0 && (
            <div className="mt-8" data-testid="risk-section">
              <h2 className="text-lg font-semibold text-emerald-100 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-400" /> At-Risk Leads
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.risks.map((risk, i) => (
                  <div key={i} className="glass-card p-4" data-testid={`risk-lead-${i}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-emerald-100 font-medium">{risk.lead_name}</span>
                      <span className={`tag tag-${risk.risk_level === "high" ? "low" : risk.risk_level}`}>{risk.risk_level}</span>
                    </div>
                    <p className="text-xs text-emerald-500/50 mb-2">{risk.company}</p>
                    <ul className="space-y-1">
                      {risk.risk_factors?.map((f, j) => (
                        <li key={j} className="text-xs text-orange-400/70 flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-orange-400/50 mt-1.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
