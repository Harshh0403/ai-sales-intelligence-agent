import { LayoutDashboard, Users, Lightbulb, Target, Upload, Brain, Layers } from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leads", label: "Lead Intelligence", icon: Users },
  { id: "insights", label: "Business Insights", icon: Lightbulb },
  { id: "recommendations", label: "Recommendations", icon: Target },
  { id: "strategy", label: "Strategy Advisor", icon: Brain },
  { id: "upload", label: "Upload Data", icon: Upload },
  { id: "ecosystem", label: "Enjay Ecosystem", icon: Layers },
];

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] border-r border-emerald-900/30 bg-[#010301] z-40 flex flex-col" data-testid="sidebar">
      <div className="p-6 border-b border-emerald-900/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-emerald-50 tracking-tight" style={{ fontFamily: 'Outfit' }}>Sales Intelligence</h1>
            <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-500/60 font-medium">AI-Powered CRM</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1" data-testid="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              data-testid={`nav-${item.id}`}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                  : "text-emerald-100/50 hover:text-emerald-100/80 hover:bg-emerald-500/5 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-emerald-500/40"}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-emerald-900/20">
        <div className="text-[10px] text-emerald-500/40 text-center uppercase tracking-wider">
          Powered by Gemini AI
        </div>
      </div>
    </aside>
  );
}
