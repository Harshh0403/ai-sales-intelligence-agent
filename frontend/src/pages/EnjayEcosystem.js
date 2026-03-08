import { Layers, ArrowRight, Zap, BarChart3, Users, Phone, MapPin, MessageSquare, Headphones, Settings } from "lucide-react";

const PRODUCTS = [
  {
    name: "Sangam CRM",
    desc: "Complete customer relationship management with AI-powered lead scoring, pipeline management, and sales forecasting.",
    icon: Users,
    color: "#10b981",
    aiFeatures: ["AI Lead Scoring", "Smart Pipeline Recommendations", "Predictive Deal Analytics"]
  },
  {
    name: "Samvad Telecaller",
    desc: "Intelligent telecalling solution with auto-dialer, call recording, and AI-powered conversation analytics.",
    icon: Phone,
    color: "#34d399",
    aiFeatures: ["Call Sentiment Analysis", "Smart Call Scheduling", "Conversation Intelligence"]
  },
  {
    name: "Synapse Call Centre",
    desc: "Enterprise call centre management with real-time monitoring, SLA tracking, and predictive staffing.",
    icon: Headphones,
    color: "#059669",
    aiFeatures: ["Predictive Queue Management", "Agent Performance AI", "Real-time Sentiment Detection"]
  },
  {
    name: "Sarathi Field Tracker",
    desc: "GPS-based field force tracking with route optimization, attendance, and task management.",
    icon: MapPin,
    color: "#047857",
    aiFeatures: ["Route Optimization AI", "Geo-fenced Analytics", "Predictive Visit Planning"]
  },
  {
    name: "WhatsApp Marketing",
    desc: "Automated WhatsApp campaigns with template management, broadcast, and engagement analytics.",
    icon: MessageSquare,
    color: "#6ee7b7",
    aiFeatures: ["Smart Message Personalization", "Optimal Send Time AI", "Response Prediction"]
  },
  {
    name: "Sales Automation",
    desc: "End-to-end sales workflow automation with email sequences, task triggers, and deal stage automation.",
    icon: Settings,
    color: "#a7f3d0",
    aiFeatures: ["Workflow Intelligence", "Deal Stage Prediction", "Churn Prevention AI"]
  }
];

const SCALE_FEATURES = [
  { title: "CRM Integration", desc: "Deep integration with Sangam CRM for seamless lead data sync and real-time scoring." },
  { title: "Automated Lead Prioritization", desc: "AI continuously re-scores leads based on engagement patterns and market signals." },
  { title: "AI Sales Assistant", desc: "Virtual sales coach that provides real-time recommendations during calls and meetings." },
  { title: "Call Transcript Analysis", desc: "NLP-powered analysis of Samvad and Synapse call recordings for actionable insights." },
  { title: "Customer Sentiment Detection", desc: "Real-time sentiment analysis across all customer touchpoints." },
  { title: "Predictive Sales Forecasting", desc: "ML models trained on historical data to predict quarterly revenue with high accuracy." }
];

export default function EnjayEcosystem() {
  return (
    <div className="page-container" data-testid="enjay-ecosystem-page">
      <div className="page-header">
        <h1 className="page-title">AI for Enjay Product Ecosystem</h1>
        <p className="page-subtitle">How AI Sales Intelligence enhances every Enjay product</p>
      </div>

      {/* Hero Banner */}
      <div className="glass-card p-8 mb-8 relative overflow-hidden" data-testid="ecosystem-hero">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-emerald-400" />
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">AI-Powered Enhancement</span>
          </div>
          <h2 className="text-2xl font-bold text-emerald-100 mb-3" style={{ fontFamily: 'Outfit' }}>
            Intelligent Automation Across Your Sales Stack
          </h2>
          <p className="text-sm text-emerald-100/60 max-w-2xl leading-relaxed">
            The AI Sales Intelligence layer connects with every Enjay product to provide unified lead analytics,
            cross-platform insights, and automated sales optimization. From CRM to call centre, every interaction
            becomes an opportunity for AI-driven growth.
          </p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10" data-testid="product-grid">
        {PRODUCTS.map((product) => {
          const Icon = product.icon;
          return (
            <div key={product.name} className="glass-card p-6 group hover:border-emerald-500/30 transition-all" data-testid={`product-${product.name.toLowerCase().replace(/ /g, "-")}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${product.color}15` }}>
                  <Icon className="w-5 h-5" style={{ color: product.color }} />
                </div>
                <h3 className="text-sm font-semibold text-emerald-100">{product.name}</h3>
              </div>
              <p className="text-xs text-emerald-100/50 mb-4 leading-relaxed">{product.desc}</p>
              <div className="space-y-1.5">
                {product.aiFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-emerald-400/70">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scalability */}
      <div data-testid="scalability-section">
        <h2 className="text-xl font-bold text-emerald-100 mb-6 flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          Future Scalability Roadmap
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCALE_FEATURES.map((feature, i) => (
            <div key={i} className="glass-card p-5 hover:border-emerald-500/30 transition-all" data-testid={`scale-feature-${i}`}>
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-emerald-100">{feature.title}</h4>
              </div>
              <p className="text-xs text-emerald-100/50 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
