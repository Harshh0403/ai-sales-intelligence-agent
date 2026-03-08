import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API } from "../App";
import { formatINR, getScoreColor } from "../lib/helpers";
import { Brain, Loader2, ChevronRight, Target, MessageCircle, Calendar, Shield } from "lucide-react";

export default function LeadStrategy({ leads, setLeads }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const loadLeads = useCallback(async () => {
    if (leads.length) return;
    try {
      const res = await axios.get(`${API}/leads`);
      setLeads(res.data);
    } catch (e) { console.error(e); }
  }, [leads.length, setLeads]);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  const getStrategy = async (lead) => {
    setSelectedLead(lead);
    setLoading(true);
    setStrategy(null);
    try {
      const res = await axios.post(`${API}/lead-strategy/${lead.id}`);
      setStrategy(res.data.strategy);
    } catch (e) {
      console.error(e);
      setStrategy({ error: "Failed to generate strategy" });
    } finally {
      setLoading(false);
    }
  };

  const filtered = leads.filter(l => !search || [l.lead_name, l.company, l.interested_product]
    .some(f => (f || "").toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="page-container" data-testid="lead-strategy-page">
      <div className="page-header">
        <h1 className="page-title">Lead Strategy Advisor</h1>
        <p className="page-subtitle">AI-powered conversion strategies for every lead</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lead List */}
        <div className="lg:col-span-5">
          <input
            data-testid="strategy-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full px-4 py-2.5 mb-4 rounded-lg bg-emerald-950/30 border border-emerald-500/15 text-emerald-100 text-sm placeholder:text-emerald-500/30 focus:outline-none focus:border-emerald-500/40"
          />
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {filtered.map(lead => (
              <button
                key={lead.id}
                data-testid={`strategy-lead-${lead.id}`}
                onClick={() => getStrategy(lead)}
                className={`w-full text-left glass-card p-4 transition-all ${
                  selectedLead?.id === lead.id ? "border-emerald-500/40 bg-emerald-500/[0.06]" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-emerald-100 truncate">{lead.lead_name}</p>
                    <p className="text-xs text-emerald-500/50 truncate">{lead.company}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{lead.interested_product}</span>
                      <span className="text-[10px] font-mono text-emerald-300">{formatINR(lead.deal_value_inr)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-lg font-mono font-bold" style={{ color: getScoreColor(lead.lead_score) }}>{lead.lead_score}</span>
                      <p className="text-[9px] text-emerald-500/40">SCORE</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-500/30" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Strategy Panel */}
        <div className="lg:col-span-7">
          {!selectedLead ? (
            <div className="glass-card p-12 text-center h-full flex flex-col items-center justify-center" data-testid="no-strategy-selected">
              <Brain className="w-12 h-12 text-emerald-500/20 mb-4" />
              <p className="text-emerald-100/50 text-sm">Select a lead to generate AI-powered strategy</p>
            </div>
          ) : loading ? (
            <div className="glass-card p-12 text-center h-full flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
              <p className="text-emerald-500/60 text-sm">Generating AI strategy for {selectedLead.lead_name}...</p>
            </div>
          ) : strategy?.error ? (
            <div className="glass-card p-8 text-center">
              <p className="text-orange-400">{strategy.error}</p>
            </div>
          ) : strategy ? (
            <div className="space-y-4" data-testid="strategy-result">
              {/* Probability */}
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-100">{selectedLead.lead_name}</h3>
                    <p className="text-xs text-emerald-500/50">{selectedLead.company} &middot; {selectedLead.interested_product}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-mono font-bold text-emerald-400">{strategy.conversion_probability}%</p>
                    <p className="text-[10px] uppercase tracking-wider text-emerald-500/60">Conversion Probability</p>
                  </div>
                </div>
                <div className="score-bar h-3">
                  <div className="score-bar-fill h-3" style={{ width: `${strategy.conversion_probability}%`, background: `linear-gradient(90deg, #064e3b, #10b981)` }} />
                </div>
              </div>

              {/* Strategy */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs uppercase tracking-wider text-emerald-500/60 font-semibold">Recommended Strategy</span>
                </div>
                <p className="text-sm text-emerald-100/80 leading-relaxed">{strategy.recommended_strategy}</p>
              </div>

              {/* Communication */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs uppercase tracking-wider text-emerald-500/60 font-semibold">Communication Approach</span>
                </div>
                <p className="text-sm text-emerald-100/80 leading-relaxed">{strategy.communication_approach}</p>
              </div>

              {/* Next Actions */}
              {strategy.next_actions?.length > 0 && (
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs uppercase tracking-wider text-emerald-500/60 font-semibold">Next Actions</span>
                  </div>
                  <div className="space-y-2">
                    {strategy.next_actions.map((action, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-emerald-500/[0.03]">
                        <span className="w-5 h-5 rounded flex items-center justify-center bg-emerald-500/15 text-emerald-400 text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                        <div>
                          <p className="text-sm text-emerald-100/80">{action.action}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-emerald-500/50">{action.timeline}</span>
                            <span className={`tag tag-${action.priority}`}>{action.priority}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Talking Points & Pitch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategy.talking_points?.length > 0 && (
                  <div className="glass-card p-5">
                    <span className="text-xs uppercase tracking-wider text-emerald-500/60 font-semibold block mb-2">Talking Points</span>
                    <ul className="space-y-1.5">
                      {strategy.talking_points.map((pt, i) => (
                        <li key={i} className="text-xs text-emerald-100/70 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {strategy.product_pitch && (
                  <div className="glass-card p-5">
                    <span className="text-xs uppercase tracking-wider text-emerald-500/60 font-semibold block mb-2">Product Pitch</span>
                    <p className="text-xs text-emerald-100/70 leading-relaxed">{strategy.product_pitch}</p>
                  </div>
                )}
              </div>

              {/* Risk & Close Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategy.risk_factors?.length > 0 && (
                  <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-orange-400" />
                      <span className="text-xs uppercase tracking-wider text-emerald-500/60 font-semibold">Risk Factors</span>
                    </div>
                    <ul className="space-y-1">
                      {strategy.risk_factors.map((r, i) => (
                        <li key={i} className="text-xs text-orange-400/70 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {strategy.estimated_close_date && (
                  <div className="glass-card p-5">
                    <span className="text-xs uppercase tracking-wider text-emerald-500/60 font-semibold block mb-2">Estimated Close</span>
                    <p className="text-lg font-mono text-emerald-300">{strategy.estimated_close_date}</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
