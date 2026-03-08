import { Lightbulb, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";

const IMPACT_ICONS = { high: TrendingUp, medium: Lightbulb, low: ArrowRight };
const IMPACT_COLORS = { high: "#10b981", medium: "#eab308", low: "#6ee7b780" };
const CATEGORY_STYLES = {
  trend: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  opportunity: { bg: "bg-cyan-500/10", text: "text-cyan-400" },
  warning: { bg: "bg-orange-500/10", text: "text-orange-400" },
};

export default function BusinessInsights({ analysis }) {
  const insights = analysis?.business_insights || [];
  const riskAlerts = analysis?.risk_alerts || [];

  return (
    <div className="page-container" data-testid="business-insights-page">
      <div className="page-header">
        <h1 className="page-title">Business Insights</h1>
        <p className="page-subtitle">AI-generated strategic intelligence from your CRM data</p>
      </div>

      {!analysis ? (
        <div className="glass-card p-12 text-center" data-testid="no-insights">
          <Lightbulb className="w-10 h-10 text-emerald-500/30 mx-auto mb-4" />
          <p className="text-emerald-100/60 text-sm">Run AI Analysis from the Dashboard to generate insights</p>
        </div>
      ) : (
        <>
          {/* Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" data-testid="insights-grid">
            {insights.map((insight, i) => {
              const Icon = IMPACT_ICONS[insight.impact] || Lightbulb;
              const cat = CATEGORY_STYLES[insight.category] || CATEGORY_STYLES.trend;
              return (
                <div key={i} className="glass-card p-5 group hover:border-emerald-500/30 transition-all" data-testid={`insight-card-${i}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${IMPACT_COLORS[insight.impact]}15` }}>
                      <Icon className="w-4 h-4" style={{ color: IMPACT_COLORS[insight.impact] }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${cat.bg} ${cat.text}`}>
                          {insight.category}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded" style={{ background: `${IMPACT_COLORS[insight.impact]}15`, color: IMPACT_COLORS[insight.impact] }}>
                          {insight.impact} impact
                        </span>
                      </div>
                      <p className="text-sm text-emerald-100/80 leading-relaxed">{insight.insight}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Risk Alerts */}
          {riskAlerts.length > 0 && (
            <div data-testid="risk-alerts">
              <h2 className="text-lg font-semibold text-emerald-100 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" /> Risk Alerts
              </h2>
              <div className="space-y-3">
                {riskAlerts.map((alert, i) => (
                  <div key={i} className="glass-card p-4 border-l-2 border-l-orange-500/50" data-testid={`risk-alert-${i}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`tag tag-${alert.severity === "high" ? "low" : alert.severity}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-emerald-500/50">{alert.affected_leads}</span>
                    </div>
                    <p className="text-sm text-emerald-100/70">{alert.alert}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
