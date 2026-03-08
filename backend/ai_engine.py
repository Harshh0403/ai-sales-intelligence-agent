"""
AI Engine — Gemini is used ONLY for Executive Summary.
All other features (insights, recommendations, strategy, outreach) use the local AI engine.
If Gemini fails, the local engine generates the summary as fallback.
"""
import os
import json
import logging
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')

logger = logging.getLogger(__name__)

# Try to initialize Gemini — never crash if it fails
_gemini_model = None
try:
    import google.generativeai as genai
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
        _gemini_model = genai.GenerativeModel("gemini-2.0-flash")
        logger.info("Gemini model initialized successfully.")
    else:
        logger.warning("GEMINI_API_KEY not set — using local AI engine only.")
except Exception as exc:
    logger.warning(f"Gemini initialization failed: {exc} — using local AI engine only.")


async def generate_executive_summary_gemini(stats: dict, sample_records: list) -> str:
    """Use Gemini ONLY for the executive summary. Returns None on failure."""
    if _gemini_model is None:
        return None

    stats_text = json.dumps(stats, indent=2, default=str)
    sample_text = json.dumps(sample_records[:10], indent=2, default=str)

    prompt = f"""You are an expert AI Sales Intelligence Analyst for Enjay IT Solutions.
Write a concise 4-5 sentence executive summary for a sales manager based on this CRM data.

STATISTICS:
{stats_text}

SAMPLE LEADS (first 10):
{sample_text}

Enjay Products: Sangam CRM, Samvad Telecaller, Synapse Call Centre, Sarathi Field Tracker, WhatsApp Marketing System, Customer Support Suite, Sales Automation Tools.

Rules:
- All monetary values in Indian Rupees (₹) with Indian numbering (e.g. ₹2,50,000).
- Be specific with numbers from the data.
- Mention the top performing region and most popular product.
- End with a clear action recommendation.
- Return ONLY the summary text, no JSON, no markdown."""

    try:
        response = _gemini_model.generate_content(prompt)
        text = response.text.strip()
        if text:
            return text
        return None
    except Exception as exc:
        logger.warning(f"Gemini executive summary failed: {exc}")
        return None
