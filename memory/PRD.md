# AI Sales Intelligence Agent - PRD

## Problem Statement
Build an AI-powered SaaS web app for CRM lead analysis using Google Gemini API. Personalized for Enjay IT Solutions products. All values in Indian Rupees (₹).

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI + Recharts
- **Backend**: FastAPI (Python) + MongoDB + Google Gemini API (gemini-2.0-flash)
- **Theme**: Deep Emerald Void (dark mode, glassmorphism, emerald accents)

## User Personas
- **Sales Managers**: Need executive summaries and lead prioritization
- **Sales Reps**: Need outreach strategies and next actions per lead
- **AI/ML Interviewers**: Evaluating technical depth of ML pipeline

## Core Requirements
- CSV upload for CRM lead data
- AI-powered lead scoring (rule-based + Gemini AI)
- Business insights generation
- Actionable recommendations
- Risk detection for inactive leads
- Lead Strategy Advisor per lead
- Outreach strategy generation
- Interactive charts (region, industry, interest, products)
- Indian Rupees (₹) formatting
- Enjay IT Solutions product ecosystem integration

## What's Been Implemented (March 8, 2026)
- ✅ Full FastAPI backend with 10+ API endpoints
- ✅ Google Gemini AI integration (gemini-2.0-flash) — ONLY for executive summary
- ✅ Local AI Intelligence Engine (pandas/numpy) — handles ALL other features
- ✅ Lead scoring model: High=+40, Medium=+25, Low=+10, Deal>₹3L=+30, Deal>₹2L=+20, Contact≤7d=+20, ≤14d=+10, normalized 0-100
- ✅ Local lead strategy advisor with conversion probability, strategy, communication approach, next actions
- ✅ Local outreach generator with subject, message, call script, channel, follow-up
- ✅ Local business insights engine (8 insight types from data patterns)
- ✅ Local recommendations engine (9 actionable items)
- ✅ Risk detection engine with 3 alert categories
- ✅ Conversion forecast (hot/warm/cold pipeline projection)
- ✅ Graceful Gemini fallback — app NEVER crashes on API failure
- ✅ Sample dataset (40 Indian leads, Enjay products)
- ✅ Dashboard with KPIs, 5 interactive charts
- ✅ Lead Intelligence table with search, sort, outreach buttons
- ✅ CSV Upload with PapaParse + sample data loader
- ✅ Enjay Product Ecosystem page (6 products + scalability roadmap)
- ✅ Deep Emerald Void theme (dark, glassmorphism, emerald green)
- ✅ INR formatting throughout
- ✅ Score bars in emerald green shades

## Prioritized Backlog
### P0 (Critical)
- None remaining

### P1 (High)
- Real-time Gemini API error handling improvement
- CSV export of analysis results

### P2 (Medium)
- Chat interface with Gemini for ad-hoc questions
- Historical analysis comparison
- Email integration for outreach
- Multi-user support with auth

## Next Tasks
1. Add CSV export for leads and analysis
2. Add comparison view for multiple analyses over time
3. Integrate email sending for outreach strategies
