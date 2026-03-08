import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")


async def analyze_leads(stats: dict, sample_records: list) -> dict:
    sample_text = json.dumps(sample_records[:15], indent=2, default=str)
    stats_text = json.dumps(stats, indent=2, default=str)

    prompt = f"""You are an expert AI Sales Intelligence Analyst for Enjay IT Solutions.
Analyze this CRM dataset and provide strategic business insights.

DATASET STATISTICS:
{stats_text}

SAMPLE LEAD RECORDS (first 15):
{sample_text}

Enjay Products: Sangam CRM, Samvad Telecaller, Synapse Call Centre, Sarathi Field Tracker, WhatsApp Marketing System, Customer Support Suite, Sales Automation Tools.

Provide your analysis in this EXACT JSON format (no markdown, just raw JSON):
{{
    "executive_summary": "A concise 3-4 sentence executive summary for managers",
    "business_insights": [
        {{"insight": "insight text", "impact": "high/medium/low", "category": "trend/opportunity/warning"}},
        {{"insight": "insight text", "impact": "high/medium/low", "category": "trend/opportunity/warning"}}
    ],
    "recommendations": [
        {{"action": "specific action", "priority": "high/medium/low", "lead": "lead or company name", "timeline": "timeframe"}},
        {{"action": "specific action", "priority": "high/medium/low", "lead": "lead or company name", "timeline": "timeframe"}}
    ],
    "risk_alerts": [
        {{"alert": "risk description", "severity": "high/medium/low", "affected_leads": "count or names"}}
    ],
    "conversion_forecast": "Brief forecast of expected conversions"
}}

Generate at least 5 business insights and 5 recommendations. All monetary values in Indian Rupees (₹). Be specific with lead names and company names from the data."""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            if text.startswith("json"):
                text = text[4:].strip()
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "executive_summary": response.text[:500] if response else "Analysis failed",
            "business_insights": [],
            "recommendations": [],
            "risk_alerts": [],
            "conversion_forecast": "Unable to parse structured forecast"
        }
    except Exception as e:
        return {
            "executive_summary": f"AI analysis encountered an error: {str(e)}",
            "business_insights": [],
            "recommendations": [],
            "risk_alerts": [],
            "conversion_forecast": "Error in forecast generation"
        }


async def generate_lead_strategy(lead: dict) -> dict:
    lead_text = json.dumps(lead, indent=2, default=str)

    prompt = f"""You are an expert AI Sales Strategist for Enjay IT Solutions.
Generate a detailed sales strategy for this specific lead.

LEAD DATA:
{lead_text}

Enjay Products: Sangam CRM, Samvad Telecaller, Synapse Call Centre, Sarathi Field Tracker, WhatsApp Marketing System, Customer Support Suite, Sales Automation Tools.

Provide your strategy in this EXACT JSON format (no markdown, just raw JSON):
{{
    "conversion_probability": 82,
    "recommended_strategy": "Detailed strategy description",
    "communication_approach": "How to communicate with this lead",
    "next_actions": [
        {{"action": "specific next step", "timeline": "when to do it", "priority": "high/medium/low"}}
    ],
    "talking_points": ["key point 1", "key point 2", "key point 3"],
    "product_pitch": "Specific pitch for the interested product",
    "risk_factors": ["potential risk 1"],
    "estimated_close_date": "estimated date range"
}}

Be specific, actionable, and reference the actual lead data. Consider the interested Enjay product."""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            if text.startswith("json"):
                text = text[4:].strip()
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "conversion_probability": 50,
            "recommended_strategy": response.text[:500] if response else "Strategy generation failed",
            "communication_approach": "Standard outreach",
            "next_actions": [],
            "talking_points": [],
            "product_pitch": "",
            "risk_factors": [],
            "estimated_close_date": "TBD"
        }
    except Exception as e:
        return {
            "conversion_probability": 0,
            "recommended_strategy": f"Error: {str(e)}",
            "communication_approach": "",
            "next_actions": [],
            "talking_points": [],
            "product_pitch": "",
            "risk_factors": [],
            "estimated_close_date": "TBD"
        }


async def generate_outreach(lead: dict) -> dict:
    lead_text = json.dumps(lead, indent=2, default=str)

    prompt = f"""You are an expert AI Sales Outreach Specialist for Enjay IT Solutions.
Generate a personalized outreach strategy for this lead.

LEAD DATA:
{lead_text}

Provide your outreach plan in this EXACT JSON format (no markdown, just raw JSON):
{{
    "subject_line": "Email subject line",
    "outreach_message": "Personalized outreach message (2-3 paragraphs)",
    "call_script": "Brief phone call script opening",
    "recommended_channel": "email/phone/whatsapp/meeting",
    "best_time_to_reach": "suggested time",
    "follow_up_plan": "Follow up strategy",
    "key_value_proposition": "Main value prop for this lead"
}}

Personalize based on the lead's company, industry, interest level, and interested Enjay product."""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            if text.startswith("json"):
                text = text[4:].strip()
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "subject_line": "Outreach Strategy",
            "outreach_message": response.text[:500] if response else "Failed to generate",
            "call_script": "",
            "recommended_channel": "email",
            "best_time_to_reach": "Business hours",
            "follow_up_plan": "Follow up in 3 days",
            "key_value_proposition": ""
        }
    except Exception as e:
        return {
            "subject_line": "Error",
            "outreach_message": f"Error: {str(e)}",
            "call_script": "",
            "recommended_channel": "email",
            "best_time_to_reach": "",
            "follow_up_plan": "",
            "key_value_proposition": ""
        }
