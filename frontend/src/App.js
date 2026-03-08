import { useState } from "react";
import "@/App.css";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import LeadIntelligence from "@/pages/LeadIntelligence";
import BusinessInsights from "@/pages/BusinessInsights";
import Recommendations from "@/pages/Recommendations";
import UploadData from "@/pages/UploadData";
import LeadStrategy from "@/pages/LeadStrategy";
import EnjayEcosystem from "@/pages/EnjayEcosystem";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [leads, setLeads] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const pages = {
    dashboard: <Dashboard leads={leads} setLeads={setLeads} analysis={analysis} setAnalysis={setAnalysis} isAnalyzing={isAnalyzing} setIsAnalyzing={setIsAnalyzing} />,
    leads: <LeadIntelligence leads={leads} setLeads={setLeads} />,
    insights: <BusinessInsights analysis={analysis} />,
    recommendations: <Recommendations analysis={analysis} />,
    upload: <UploadData leads={leads} setLeads={setLeads} />,
    strategy: <LeadStrategy leads={leads} setLeads={setLeads} />,
    ecosystem: <EnjayEcosystem />,
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="main-content">
        {pages[activePage]}
      </main>
    </div>
  );
}

export default App;
