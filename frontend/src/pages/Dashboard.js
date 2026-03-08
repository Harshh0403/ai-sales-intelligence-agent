import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API } from "../App";
import { formatINR, getScoreColor } from "../lib/helpers";
import { TrendingUp, Users, IndianRupee, Target, Zap, BarChart3, Activity, Loader2, Layers } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

const CHART_COLORS = ["#10b981", "#34d399", "#059669", "#064e3b", "#6ee7b7", "#047857"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a1a0f] border border-emerald-500/30 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-emerald-300 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-emerald-100/80">{p.name}: {typeof p.value === "number" && p.value > 999 ? formatINR(p.value) : p.value}</p>
      ))}
    </div>
  );
};

export default function Dashboard({ leads, setLeads, analysis, setAnalysis, isAnalyzing, setIsAnalyzing }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [leadsRes, statsRes, analysisRes] = await Promise.all([
        axios.get(`${API}/leads`),
        axios.get(`${API}/dashboard-stats`),
        axios.get(`${API}/analysis`)
      ]);
      setLeads(leadsRes.data);
      setStats(statsRes.data);
      if (analysisRes.data) setAnalysis(analysisRes.data);
    } catch (e) {
      console.error("Load error:", e);
    } finally {
      setLoading(false);
    }
  }, [setLeads, setAnalysis]);

  useEffect(() => { loadData(); }, [loadData]);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await axios.post(`${API}/analyze`);
      setAnalysis(res.data);
      const statsRes = await axios.get(`${API}/dashboard-stats`);
      setStats(statsRes.data);
    } catch (e) {
      console.error("Analysis error:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) return (
    <div className="page-container flex items-center justify-center h-screen">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
        <p className="text-emerald-500/60 text-sm">Loading intelligence data...</p>
      </div>
    </div>
  );

  const regionData = stats?.region_distribution ? Object.entries(stats.region_distribution).map(([k, v]) => ({ name: k, value: v })) : [];
  const industryDealData = stats?.deal_value_by_industry ? Object.entries(stats.deal_value_by_industry).map(([k, v]) => ({ name: k, total: v.total, avg: v.avg, count: v.count })).sort((a, b) => b.total - a.total).slice(0, 8) : [];
  const interestData = stats?.interest_distribution ? Object.entries(stats.interest_distribution).map(([k, v]) => ({ name: k, value: v })) : [];
  const productData = stats?.product_distribution ? Object.entries(stats.product_distribution).map(([k, v]) => ({ name: k.replace("System", "").replace("Suite", "").trim(), value: v })) : [];
  const scoreDistribution = leads.length ? [
    { name: "Hot (70+)", value: leads.filter(l => l.lead_score >= 70).length },
    { name: "Warm (40-69)", value: leads.filter(l => l.lead_score >= 40 && l.lead_score < 70).length },
    { name: "Cold (<40)", value: leads.filter(l => l.lead_score < 40).length }
  ] : [];

  return (
    <div className="page-container" data-testid="dashboard-page">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">AI Sales Intelligence</h1>
          <p className="page-subtitle">AI-powered lead analysis for smarter sales decisions</p>
        </div>
        <button
          data-testid="analyze-btn"
          onClick={runAnalysis}
          disabled={isAnalyzing || !leads.length}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 active:scale-95 disabled:opacity-50 bg-emerald-500 text-emerald-950 hover:bg-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"
        >
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-testid="kpi-cards">
        {[
          { label: "Total Leads", value: stats?.total_leads || 0, icon: Users, format: "num" },
          { label: "Pipeline Value", value: stats?.total_deal_value || 0, icon: IndianRupee, format: "inr" },
          { label: "Avg Deal Size", value: stats?.avg_deal_value || 0, icon: TrendingUp, format: "inr" },
          { label: "Conversion Ready", value: stats?.conversion_ready || 0, icon: Target, format: "num" },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card" data-testid={`kpi-${kpi.label.toLowerCase().replace(/ /g, "-")}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase tracking-wider text-emerald-500/60 font-semibold">{kpi.label}</span>
              <kpi.icon className="w-4 h-4 text-emerald-500/40" />
            </div>
            <p className="text-3xl font-mono font-bold text-emerald-50 tracking-tighter">
              {kpi.format === "inr" ? formatINR(kpi.value) : kpi.value.toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>

      {/* Executive Summary */}
      {analysis?.executive_summary && (
        <div className="glass-card p-6 mb-8" data-testid="executive-summary">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Executive Summary</span>
          </div>
          <p className="text-emerald-100/80 text-sm leading-relaxed">{analysis.executive_summary}</p>
          {analysis.conversion_forecast && (
            <p className="text-emerald-500/70 text-xs mt-3 italic">{analysis.conversion_forecast}</p>
          )}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" data-testid="charts-section">
        {/* Lead Distribution by Region */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-emerald-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" /> Lead Distribution by Region
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={regionData}>
              <XAxis dataKey="name" tick={{ fill: "#6ee7b780", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6ee7b740", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Leads" radius={[6, 6, 0, 0]}>
                {regionData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Interest Level Segmentation */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-emerald-100 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" /> Interest Level Segmentation
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={interestData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" nameKey="name" stroke="none">
                {interestData.map((_, i) => <Cell key={i} fill={["#10b981", "#eab308", "#f97316"][i % 3]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {interestData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5 text-[10px] text-emerald-100/60">
                <span className="w-2 h-2 rounded-full" style={{ background: ["#10b981", "#eab308", "#f97316"][i % 3] }} />
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>

        {/* Deal Value by Industry */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-emerald-100 mb-4 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-400" /> Deal Value by Industry
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={industryDealData}>
              <defs>
                <linearGradient id="dealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: "#6ee7b760", fontSize: 9 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fill: "#6ee7b740", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" name="Total Value" stroke="#10b981" fill="url(#dealGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Score Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-emerald-100 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" /> Lead Score Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={scoreDistribution} cx="50%" cy="50%" outerRadius={95} dataKey="value" nameKey="name" stroke="none" label={({ name, value }) => `${name}: ${value}`}>
                {scoreDistribution.map((_, i) => <Cell key={i} fill={["#10b981", "#eab308", "#f97316"][i]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Product Interest */}
        {productData.length > 0 && (
          <div className="glass-card p-6 lg:col-span-2">
            <h3 className="text-sm font-semibold text-emerald-100 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" /> Product Interest Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={productData} layout="vertical">
                <XAxis type="number" tick={{ fill: "#6ee7b740", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#6ee7b780", fontSize: 10 }} axisLine={false} tickLine={false} width={130} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Leads" radius={[0, 6, 6, 0]}>
                  {productData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Leads */}
      {leads.length > 0 && (
        <div className="glass-card p-6" data-testid="top-leads">
          <h3 className="text-sm font-semibold text-emerald-100 mb-4">Top Leads by Score</h3>
          <div className="space-y-3">
            {leads.sort((a, b) => b.lead_score - a.lead_score).slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between py-2 border-b border-emerald-900/20 last:border-0">
                <div className="flex-1">
                  <p className="text-sm text-emerald-100 font-medium">{lead.lead_name}</p>
                  <p className="text-xs text-emerald-500/50">{lead.company} &middot; {lead.interested_product}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-emerald-300">{formatINR(lead.deal_value_inr)}</span>
                  <div className="w-24">
                    <div className="score-bar">
                      <div className="score-bar-fill" style={{ width: `${lead.lead_score}%`, background: getScoreColor(lead.lead_score) }} />
                    </div>
                    <span className="text-[10px] font-mono mt-0.5 block" style={{ color: getScoreColor(lead.lead_score) }}>{lead.lead_score}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
