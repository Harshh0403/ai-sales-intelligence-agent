import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API } from "../App";
import { formatINR, getScoreColor, getScoreLabel } from "../lib/helpers";
import { Search, ArrowUpDown, MessageSquare, Loader2, X } from "lucide-react";

export default function LeadIntelligence({ leads, setLeads }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("lead_score");
  const [sortDir, setSortDir] = useState("desc");
  const [outreachLead, setOutreachLead] = useState(null);
  const [outreachData, setOutreachData] = useState(null);
  const [outreachLoading, setOutreachLoading] = useState(false);

  const loadLeads = useCallback(async () => {
    if (leads.length) return;
    try {
      const res = await axios.get(`${API}/leads`);
      setLeads(res.data);
    } catch (e) { console.error(e); }
  }, [leads.length, setLeads]);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  const handleOutreach = async (lead) => {
    setOutreachLead(lead);
    setOutreachLoading(true);
    setOutreachData(null);
    try {
      const res = await axios.post(`${API}/outreach/${lead.id}`);
      setOutreachData(res.data.outreach);
    } catch (e) {
      console.error(e);
      setOutreachData({ error: "Failed to generate outreach strategy" });
    } finally {
      setOutreachLoading(false);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortDir("desc"); }
  };

  const filtered = leads
    .filter(l => !search || [l.lead_name, l.company, l.industry, l.interested_product, l.region]
      .some(f => (f || "").toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      const av = a[sortBy], bv = b[sortBy];
      const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });

  return (
    <div className="page-container" data-testid="lead-intelligence-page">
      <div className="page-header">
        <h1 className="page-title">Lead Intelligence</h1>
        <p className="page-subtitle">AI-scored leads with actionable outreach strategies</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/40" />
        <input
          data-testid="lead-search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search leads, companies, products..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/15 text-emerald-100 text-sm placeholder:text-emerald-500/30 focus:outline-none focus:border-emerald-500/40"
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden" data-testid="leads-table">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-emerald-900/30">
                {[
                  { key: "lead_name", label: "Lead" },
                  { key: "company", label: "Company" },
                  { key: "industry", label: "Industry" },
                  { key: "interested_product", label: "Product" },
                  { key: "deal_value_inr", label: "Deal Value" },
                  { key: "interest_level", label: "Interest" },
                  { key: "lead_score", label: "Score" },
                  { key: "region", label: "Region" },
                ].map(col => (
                  <th key={col.key}
                    className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-emerald-500/60 font-semibold cursor-pointer hover:text-emerald-400/80 select-none"
                    onClick={() => toggleSort(col.key)}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {sortBy === col.key && <ArrowUpDown className="w-3 h-3" />}
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-emerald-500/60 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id} className="border-b border-emerald-900/10 hover:bg-emerald-500/[0.03] transition-colors" data-testid={`lead-row-${lead.id}`}>
                  <td className="px-4 py-3 font-medium text-emerald-100">{lead.lead_name}</td>
                  <td className="px-4 py-3 text-emerald-100/70">{lead.company}</td>
                  <td className="px-4 py-3 text-emerald-100/50 text-xs">{lead.industry}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{lead.interested_product}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-emerald-300 text-xs">{formatINR(lead.deal_value_inr)}</td>
                  <td className="px-4 py-3">
                    <span className={`tag tag-${lead.interest_level?.toLowerCase()}`}>{lead.interest_level}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 score-bar">
                        <div className="score-bar-fill" style={{ width: `${lead.lead_score}%`, background: getScoreColor(lead.lead_score) }} />
                      </div>
                      <span className="text-xs font-mono" style={{ color: getScoreColor(lead.lead_score) }}>{lead.lead_score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-emerald-100/50 text-xs">{lead.region}</td>
                  <td className="px-4 py-3">
                    <button
                      data-testid={`outreach-btn-${lead.id}`}
                      onClick={() => handleOutreach(lead)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                    >
                      <MessageSquare className="w-3 h-3" /> Outreach
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-emerald-500/40 text-sm">No leads found</div>
        )}
      </div>

      {/* Outreach Modal */}
      {outreachLead && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="outreach-modal">
          <div className="glass-card w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-emerald-100">{outreachLead.lead_name}</h3>
                <p className="text-xs text-emerald-500/60">{outreachLead.company} &middot; {outreachLead.interested_product}</p>
              </div>
              <button onClick={() => { setOutreachLead(null); setOutreachData(null); }} className="text-emerald-500/40 hover:text-emerald-300" data-testid="close-outreach-modal">
                <X className="w-5 h-5" />
              </button>
            </div>

            {outreachLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                <span className="ml-3 text-emerald-500/60 text-sm">Generating AI outreach strategy...</span>
              </div>
            ) : outreachData?.error ? (
              <p className="text-orange-400 text-sm">{outreachData.error}</p>
            ) : outreachData ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-500/60 font-semibold">Subject Line</span>
                  <p className="text-sm text-emerald-100 mt-1">{outreachData.subject_line}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-500/60 font-semibold">Channel</span>
                  <span className="ml-2 tag tag-high">{outreachData.recommended_channel}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-500/60 font-semibold">Outreach Message</span>
                  <p className="text-sm text-emerald-100/80 mt-1 whitespace-pre-line">{outreachData.outreach_message}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-500/60 font-semibold">Call Script</span>
                  <p className="text-sm text-emerald-100/70 mt-1 italic">{outreachData.call_script}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-500/60 font-semibold">Best Time</span>
                    <p className="text-sm text-emerald-100/70 mt-1">{outreachData.best_time_to_reach}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-500/60 font-semibold">Follow-up Plan</span>
                    <p className="text-sm text-emerald-100/70 mt-1">{outreachData.follow_up_plan}</p>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-500/60 font-semibold">Key Value Proposition</span>
                  <p className="text-sm text-emerald-300 mt-1 font-medium">{outreachData.key_value_proposition}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
