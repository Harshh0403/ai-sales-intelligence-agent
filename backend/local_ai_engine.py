"""
Local AI Intelligence Engine
Pure Python/pandas/numpy analytics - no external API dependency.
Generates insights, strategies, outreach, and recommendations locally.
"""
import pandas as pd
import numpy as np
from datetime import datetime
from data_processor import format_inr


# ── Product knowledge base ──────────────────────────────────────────

PRODUCT_KNOWLEDGE = {
    "Sangam CRM": {
        "pitch": "Sangam CRM automates your entire sales pipeline — from lead capture to deal closure — with real-time analytics and team collaboration tools.",
        "benefits": ["Automated lead tracking", "Sales pipeline visualization", "Team performance analytics", "Custom reporting dashboards"],
        "demo_focus": "CRM automation and sales pipeline management",
        "ideal_for": "Sales teams looking to streamline pipeline management and boost conversion rates"
    },
    "Samvad Telecaller": {
        "pitch": "Samvad Telecaller maximizes your telecalling efficiency with auto-dialer, call recording, and intelligent call disposition management.",
        "benefits": ["Auto-dialer with predictive calling", "Call recording and monitoring", "Disposition management", "Performance dashboards"],
        "demo_focus": "Telecaller productivity and call management features",
        "ideal_for": "Outbound calling teams that need higher connect rates and call efficiency"
    },
    "Synapse Call Centre": {
        "pitch": "Synapse Call Centre delivers enterprise-grade call center management with IVR, queue management, SLA tracking, and real-time agent monitoring.",
        "benefits": ["Multi-level IVR", "Queue management", "SLA tracking", "Real-time monitoring"],
        "demo_focus": "Call centre operations and SLA compliance capabilities",
        "ideal_for": "Customer support teams requiring structured call centre operations"
    },
    "Sarathi Field Tracker": {
        "pitch": "Sarathi Field Tracker provides GPS-based field force management with route optimization, attendance tracking, and real-time visit logging.",
        "benefits": ["GPS tracking", "Route optimization", "Attendance management", "Visit logging"],
        "demo_focus": "Field force tracking and route optimization features",
        "ideal_for": "Companies with field sales or service teams needing location intelligence"
    },
    "WhatsApp Marketing System": {
        "pitch": "WhatsApp Marketing System enables automated WhatsApp campaigns with template management, broadcast messaging, and engagement analytics.",
        "benefits": ["Automated campaigns", "Template management", "Broadcast messaging", "Engagement tracking"],
        "demo_focus": "WhatsApp campaign automation and engagement analytics",
        "ideal_for": "Marketing teams wanting to leverage WhatsApp for customer engagement"
    },
    "Customer Support Suite": {
        "pitch": "Customer Support Suite provides omnichannel support management with ticket tracking, SLA management, and customer satisfaction scoring.",
        "benefits": ["Omnichannel support", "Ticket management", "SLA compliance", "CSAT scoring"],
        "demo_focus": "Support ticket management and customer satisfaction tracking",
        "ideal_for": "Support teams needing structured ticket management and SLA tracking"
    },
    "Sales Automation Tools": {
        "pitch": "Sales Automation Tools streamline your entire sales workflow with email sequences, task automation, and intelligent deal stage management.",
        "benefits": ["Email sequence automation", "Task triggers", "Deal stage automation", "Workflow builder"],
        "demo_focus": "Sales workflow automation and deal pipeline management",
        "ideal_for": "Sales operations teams looking to automate repetitive sales tasks"
    }
}


# ── Local Business Insights ──────────────────────────────────────────

def generate_local_insights(df: pd.DataFrame, stats: dict) -> list:
    insights = []

    # Region analysis
    if "region" in df.columns and "deal_value_inr" in df.columns:
        region_avg = df.groupby("region")["deal_value_inr"].mean()
        top_region = region_avg.idxmax()
        overall_avg = df["deal_value_inr"].mean()
        pct_above = int(((region_avg[top_region] - overall_avg) / overall_avg) * 100)
        if pct_above > 0:
            insights.append({
                "insight": f"Leads in the {top_region} region show {pct_above}% higher average deal value ({format_inr(int(region_avg[top_region]))}) compared to overall average.",
                "impact": "high",
                "category": "trend"
            })

    # High interest + high value leads
    if "interest_level" in df.columns and "deal_value_inr" in df.columns:
        high_val = df[(df["interest_level"] == "High") & (df["deal_value_inr"] >= 200000)]
        if len(high_val) > 0:
            insights.append({
                "insight": f"High interest leads with deal values above ₹2,00,000 are likely to convert. Found {len(high_val)} such leads worth {format_inr(int(high_val['deal_value_inr'].sum()))} in total.",
                "impact": "high",
                "category": "opportunity"
            })

    # Product demand analysis
    if "interested_product" in df.columns:
        top_product = df["interested_product"].value_counts().idxmax()
        top_count = df["interested_product"].value_counts().max()
        insights.append({
            "insight": f"{top_product} is the most demanded product with {top_count} interested leads — consider allocating more sales resources to this product line.",
            "impact": "high",
            "category": "opportunity"
        })

    # Inactivity warning
    if "last_contact_date" in df.columns:
        today = datetime.now()
        df_copy = df.copy()
        df_copy["last_contact_date"] = pd.to_datetime(df_copy["last_contact_date"], errors="coerce")
        df_copy["days_since"] = (today - df_copy["last_contact_date"]).dt.days
        inactive = df_copy[df_copy["days_since"] > 30]
        if len(inactive) > 0:
            insights.append({
                "insight": f"{len(inactive)} leads have not been contacted in over 30 days — these are at high risk of being lost to competitors.",
                "impact": "high",
                "category": "warning"
            })

    # Industry analysis
    if "industry" in df.columns and "deal_value_inr" in df.columns:
        ind_total = df.groupby("industry")["deal_value_inr"].sum().sort_values(ascending=False)
        if len(ind_total) >= 2:
            top_ind = ind_total.index[0]
            insights.append({
                "insight": f"The {top_ind} industry leads the pipeline with {format_inr(int(ind_total.iloc[0]))} in total deal value across {len(df[df['industry']==top_ind])} leads.",
                "impact": "medium",
                "category": "trend"
            })

    # Interest level distribution insight
    if "interest_level" in df.columns:
        dist = df["interest_level"].value_counts()
        low_count = dist.get("Low", 0)
        total = len(df)
        if low_count > 0:
            low_pct = int((low_count / total) * 100)
            insights.append({
                "insight": f"{low_pct}% of leads ({low_count}) show low interest — consider re-engagement campaigns or nurture sequences for these leads.",
                "impact": "medium",
                "category": "warning"
            })

    # Deal value concentration
    if "deal_value_inr" in df.columns:
        high_val_leads = df[df["deal_value_inr"] >= 500000]
        if len(high_val_leads) > 0:
            total_val = df["deal_value_inr"].sum()
            hv_val = high_val_leads["deal_value_inr"].sum()
            hv_pct = int((hv_val / total_val) * 100) if total_val > 0 else 0
            insights.append({
                "insight": f"Top {len(high_val_leads)} high-value leads (deal ≥ ₹5,00,000) account for {hv_pct}% of total pipeline value — prioritize these for immediate follow-up.",
                "impact": "high",
                "category": "opportunity"
            })

    # Recent engagement
    if "last_contact_date" in df.columns:
        today = datetime.now()
        df_copy2 = df.copy()
        df_copy2["last_contact_date"] = pd.to_datetime(df_copy2["last_contact_date"], errors="coerce")
        df_copy2["days_since"] = (today - df_copy2["last_contact_date"]).dt.days
        recent = df_copy2[df_copy2["days_since"] <= 7]
        if len(recent) > 0:
            insights.append({
                "insight": f"{len(recent)} leads were contacted within the last 7 days — these are in the active engagement window and should be prioritized for conversion.",
                "impact": "medium",
                "category": "trend"
            })

    return insights


# ── Local Recommendations ────────────────────────────────────────────

def generate_local_recommendations(df: pd.DataFrame, leads: list) -> list:
    recommendations = []
    today = datetime.now()

    # Sort leads by score descending
    scored = sorted(leads, key=lambda x: x.get("lead_score", 0), reverse=True)

    # Top lead follow-up
    for lead in scored[:3]:
        product = lead.get("interested_product", "Enjay product")
        pk = PRODUCT_KNOWLEDGE.get(product, {})
        recommendations.append({
            "action": f"Follow up with {lead.get('lead_name')} at {lead.get('company')} within 24 hours. Focus on {pk.get('demo_focus', 'product benefits')}.",
            "priority": "high",
            "lead": f"{lead.get('lead_name')} - {lead.get('company')}",
            "timeline": "Within 24 hours"
        })

    # High value demo scheduling
    high_val = [r for r in leads if r.get("deal_value_inr", 0) >= 300000 and r.get("interest_level") == "High"]
    for lead in high_val[:2]:
        product = lead.get("interested_product", "")
        recommendations.append({
            "action": f"Schedule a product demo for {lead.get('lead_name')} ({lead.get('company')}). Deal value: {format_inr(lead.get('deal_value_inr', 0))}. Highlight {product} features.",
            "priority": "high",
            "lead": f"{lead.get('lead_name')} - {lead.get('company')}",
            "timeline": "Within 48 hours"
        })

    # Inactive lead re-engagement
    for lead in leads:
        last_contact = lead.get("last_contact_date", "")
        if last_contact:
            try:
                lcd = datetime.strptime(str(last_contact)[:10], "%Y-%m-%d")
                days = (today - lcd).days
                if days > 21:
                    recommendations.append({
                        "action": f"Re-engage {lead.get('lead_name')} at {lead.get('company')} — no contact in {days} days. Send a personalized check-in email about {lead.get('interested_product', 'their interest')}.",
                        "priority": "medium",
                        "lead": f"{lead.get('lead_name')} - {lead.get('company')}",
                        "timeline": "Within 3 days"
                    })
                    if len(recommendations) >= 8:
                        break
            except (ValueError, TypeError):
                pass

    # Product-specific recommendation
    if "interested_product" in df.columns:
        top_product = df["interested_product"].value_counts().idxmax()
        recommendations.append({
            "action": f"Prepare a batch demo session for {top_product} — it has the highest demand. Coordinate with the product team for a webinar.",
            "priority": "medium",
            "lead": f"All {top_product} leads",
            "timeline": "Within 1 week"
        })

    return recommendations[:10]


# ── Local Risk Alerts ────────────────────────────────────────────────

def generate_local_risk_alerts(risks: list) -> list:
    alerts = []
    high_risks = [r for r in risks if r["risk_level"] == "high"]
    med_risks = [r for r in risks if r["risk_level"] == "medium"]

    if high_risks:
        names = ", ".join([r["lead_name"] for r in high_risks[:3]])
        alerts.append({
            "alert": f"{len(high_risks)} leads at high risk of being lost due to prolonged inactivity and competitive evaluation.",
            "severity": "high",
            "affected_leads": f"{names}" + (f" and {len(high_risks)-3} more" if len(high_risks) > 3 else "")
        })

    if med_risks:
        alerts.append({
            "alert": f"{len(med_risks)} leads showing medium risk signals — delayed decisions or gaps in follow-up detected.",
            "severity": "medium",
            "affected_leads": f"{len(med_risks)} leads"
        })

    # Competitor risk
    competitor_leads = [r for r in risks if any("competitor" in f.lower() for f in r.get("risk_factors", []))]
    if competitor_leads:
        names = ", ".join([r["lead_name"] for r in competitor_leads[:3]])
        alerts.append({
            "alert": f"{len(competitor_leads)} leads are actively evaluating competitor products — immediate intervention recommended.",
            "severity": "high",
            "affected_leads": names
        })

    return alerts


# ── Local Conversion Forecast ────────────────────────────────────────

def generate_local_conversion_forecast(stats: dict, leads: list) -> str:
    total = stats.get("total_leads", 0)
    if total == 0:
        return "No leads to forecast."

    hot = sum(1 for r in leads if r.get("lead_score", 0) >= 70)
    warm = sum(1 for r in leads if 40 <= r.get("lead_score", 0) < 70)

    estimated_conversions = int(hot * 0.7 + warm * 0.25)
    hot_value = sum(r.get("deal_value_inr", 0) for r in leads if r.get("lead_score", 0) >= 70)
    estimated_revenue = int(hot_value * 0.7)

    return (
        f"Based on current lead scores: {hot} hot leads (70%+ conversion rate), "
        f"{warm} warm leads (25% conversion rate). "
        f"Estimated conversions this quarter: {estimated_conversions} deals. "
        f"Projected pipeline revenue: {format_inr(estimated_revenue)}."
    )


# ── Local Executive Summary (fallback) ───────────────────────────────

def generate_local_executive_summary(stats: dict, leads: list) -> str:
    total = stats.get("total_leads", 0)
    total_val = stats.get("total_deal_value", 0)
    avg_val = stats.get("avg_deal_value", 0)
    conv_ready = stats.get("conversion_ready", 0)

    hot = sum(1 for r in leads if r.get("lead_score", 0) >= 70)
    warm = sum(1 for r in leads if 40 <= r.get("lead_score", 0) < 70)
    cold = total - hot - warm

    top_region = ""
    if stats.get("deal_value_by_region"):
        top_region = max(stats["deal_value_by_region"], key=stats["deal_value_by_region"].get)

    summary = (
        f"Your CRM pipeline contains {total} active leads with a total deal value of {format_inr(total_val)} "
        f"(average {format_inr(avg_val)} per deal). "
        f"Lead scoring analysis reveals {hot} hot leads, {warm} warm leads, and {cold} cold leads. "
        f"{conv_ready} leads are conversion-ready with high interest and deal values above ₹2,00,000."
    )

    if top_region:
        summary += f" The {top_region} region leads in total deal value."

    summary += (
        f" Immediate action is recommended on the {hot} hot leads to maximize this quarter's conversion rate."
    )

    return summary


# ── Local Lead Strategy ──────────────────────────────────────────────

def generate_local_strategy(lead: dict) -> dict:
    score = lead.get("lead_score", 0)
    interest = lead.get("interest_level", "Low")
    deal_val = lead.get("deal_value_inr", 0)
    product = lead.get("interested_product", "")
    company = lead.get("company", "Unknown")
    name = lead.get("lead_name", "Unknown")
    notes = lead.get("notes", "")
    pk = PRODUCT_KNOWLEDGE.get(product, {
        "pitch": f"Our {product} solution delivers measurable results.",
        "benefits": ["Improved efficiency", "Better analytics", "Streamlined workflow"],
        "demo_focus": "key product capabilities",
        "ideal_for": "teams looking to improve operational efficiency"
    })

    # Conversion probability from score + additional factors
    prob = min(95, max(10, score + np.random.randint(-5, 6)))

    # Strategy based on interest level
    if interest == "High" and deal_val >= 300000:
        strategy = (
            f"This is a high-priority lead. {name} at {company} shows strong buying signals with high interest "
            f"and a deal value of {format_inr(deal_val)}. Schedule an executive-level product demo for {product} "
            f"within 24 hours. {pk['pitch']} Prepare a customized ROI presentation tailored to the {lead.get('industry', 'their')} industry."
        )
        comm = f"Executive consultative approach. Lead with business impact and ROI data specific to {company}. Request a meeting with the decision-maker."
    elif interest == "High":
        strategy = (
            f"{name} at {company} has high interest in {product}. Schedule a personalized demo "
            f"showcasing {pk.get('demo_focus', 'key features')}. Emphasize how {product} is {pk.get('ideal_for', 'ideal for their use case')}."
        )
        comm = f"Consultative discussion focusing on {company}'s specific pain points. Personalize the conversation around their industry ({lead.get('industry', 'sector')})."
        timeline = "Within 24-48 hours"
    elif interest == "Medium":
        strategy = (
            f"{name} at {company} shows moderate interest in {product}. Send a detailed case study "
            f"from the {lead.get('industry', 'same')} industry. Follow up with a call to address questions and position {product} benefits."
        )
        comm = f"Educational approach — share relevant content about {product} benefits and industry case studies before pushing for a demo."
        timeline = "Within 3-5 days"
    else:
        strategy = (
            f"{name} at {company} currently shows low interest in {product}. Add to nurture sequence with "
            f"industry-relevant content. Consider inviting to a {product} webinar to re-engage."
        )
        comm = "Soft-touch nurture approach. Avoid hard selling. Share valuable industry insights and gradually introduce product value."
        timeline = "Within 1-2 weeks"

    # Next actions
    actions = []
    if interest == "High":
        actions.append({"action": f"Schedule demo call with {name} for {product}", "timeline": "Within 24 hours", "priority": "high"})
        actions.append({"action": f"Prepare ROI analysis for {company}", "timeline": "Before demo", "priority": "high"})
        actions.append({"action": f"Send personalized {product} brochure", "timeline": "Immediately", "priority": "medium"})
    elif interest == "Medium":
        actions.append({"action": f"Send case study relevant to {lead.get('industry', 'their industry')}", "timeline": "Within 2 days", "priority": "high"})
        actions.append({"action": f"Follow up call to discuss {product} fit", "timeline": "Within 5 days", "priority": "medium"})
        actions.append({"action": "Share product comparison document", "timeline": "Within 1 week", "priority": "medium"})
    else:
        actions.append({"action": f"Add {name} to {product} nurture email sequence", "timeline": "Within 3 days", "priority": "medium"})
        actions.append({"action": f"Invite to upcoming {product} webinar", "timeline": "Next scheduled webinar", "priority": "low"})

    # Risk factors
    risk_factors = []
    if "competitor" in notes.lower():
        risk_factors.append("Actively evaluating competitor products")
    if "budget" in notes.lower():
        risk_factors.append("Budget constraints mentioned")
    if "leave" in notes.lower() or "waiting" in notes.lower():
        risk_factors.append("Decision-maker unavailability causing delays")
    if interest == "Low":
        risk_factors.append("Low engagement level — may not convert without intervention")

    # Estimated close date
    if interest == "High" and deal_val >= 300000:
        close = "2-3 weeks"
    elif interest == "High":
        close = "3-4 weeks"
    elif interest == "Medium":
        close = "4-8 weeks"
    else:
        close = "8-12 weeks (requires nurturing)"

    return {
        "conversion_probability": int(prob),
        "recommended_strategy": strategy,
        "communication_approach": comm,
        "next_actions": actions,
        "talking_points": pk.get("benefits", [])[:4],
        "product_pitch": pk.get("pitch", ""),
        "risk_factors": risk_factors if risk_factors else ["No significant risks identified"],
        "estimated_close_date": close
    }


# ── Local Outreach Generator ────────────────────────────────────────

def generate_local_outreach(lead: dict) -> dict:
    name = lead.get("lead_name", "Sir/Madam")
    company = lead.get("company", "your company")
    product = lead.get("interested_product", "our solution")
    industry = lead.get("industry", "your industry")
    interest = lead.get("interest_level", "")

    pk = PRODUCT_KNOWLEDGE.get(product, {
        "pitch": f"{product} delivers measurable business results.",
        "benefits": ["Improved efficiency", "Better analytics", "Streamlined operations"],
        "demo_focus": "key product features",
        "ideal_for": "teams seeking operational improvement"
    })

    subject = f"Improve your {industry.lower()} operations with {product}"

    benefits_text = ", ".join(pk.get("benefits", ["improved efficiency"])[:3])

    message = (
        f"Hello {name},\n\n"
        f"We noticed that {company} showed interest in {product}. "
        f"Our solution helps companies in the {industry} sector achieve {benefits_text}.\n\n"
        f"{pk.get('pitch', '')}\n\n"
        f"Would you be available for a quick 20-minute demo this week? "
        f"I'd love to show you how {product} can specifically benefit {company}.\n\n"
        f"Best regards,\nSales Team\nEnjay IT Solutions"
    )

    call_script = (
        f"Hi {name}, this is [Your Name] from Enjay IT Solutions. "
        f"I'm reaching out because {company} expressed interest in {product}. "
        f"I'd love to take 5 minutes to understand your current challenges "
        f"and show how we've helped similar {industry} companies. Is now a good time?"
    )

    if interest == "High":
        channel = "phone"
        best_time = "Morning 10-11 AM or post-lunch 2-3 PM (IST)"
        follow_up = "If no response in 24 hours, follow up via WhatsApp with a brief message and product link."
    elif interest == "Medium":
        channel = "email"
        best_time = "Tuesday-Thursday, 10 AM - 12 PM (IST)"
        follow_up = "Follow up in 3 days with a case study. If no response, try a phone call after 5 days."
    else:
        channel = "email"
        best_time = "Mid-week, business hours (IST)"
        follow_up = "Add to drip campaign. Follow up in 7 days. Invite to upcoming webinar."

    key_vp = f"{product} helps {industry} companies like {company} achieve measurable improvement in {pk.get('demo_focus', 'operational efficiency')}."

    return {
        "subject_line": subject,
        "outreach_message": message,
        "call_script": call_script,
        "recommended_channel": channel,
        "best_time_to_reach": best_time,
        "follow_up_plan": follow_up,
        "key_value_proposition": key_vp
    }
