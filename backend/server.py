from fastapi import FastAPI, APIRouter, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import io
import csv
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
import pandas as pd

from sample_data import get_sample_records
from data_processor import process_csv_data, calculate_lead_scores, detect_risks, generate_statistics
from ai_engine import generate_executive_summary_gemini
from local_ai_engine import (
    generate_local_insights,
    generate_local_recommendations,
    generate_local_risk_alerts,
    generate_local_conversion_forecast,
    generate_local_executive_summary,
    generate_local_strategy,
    generate_local_outreach,
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="AI Sales Intelligence Agent")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# Models
class LeadRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lead_name: str = ""
    company: str = ""
    industry: str = ""
    interest_level: str = ""
    deal_value_inr: int = 0
    last_contact_date: str = ""
    notes: str = ""
    region: str = ""
    interested_product: str = ""
    lead_score: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# Routes
@api_router.get("/")
async def root():
    return {"message": "AI Sales Intelligence Agent API", "status": "active"}


@api_router.get("/leads")
async def get_leads():
    leads = await db.leads.find({}, {"_id": 0}).to_list(1000)
    if not leads:
        sample = get_sample_records()
        df = process_csv_data(sample)
        scores = calculate_lead_scores(df)
        for i, record in enumerate(sample):
            record["id"] = str(uuid.uuid4())
            record["lead_score"] = scores[i]
            record["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.leads.insert_many([{k: v for k, v in r.items()} for r in sample])
        leads = await db.leads.find({}, {"_id": 0}).to_list(1000)
    return leads


@api_router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))
    records = list(reader)
    if not records:
        return {"error": "Empty CSV file"}

    df = process_csv_data(records)
    scores = calculate_lead_scores(df)
    await db.leads.delete_many({})

    for i, record in enumerate(records):
        record["id"] = str(uuid.uuid4())
        record["lead_score"] = scores[i]
        record["deal_value_inr"] = int(float(record.get("deal_value_inr", 0)))
        record["created_at"] = datetime.now(timezone.utc).isoformat()

    await db.leads.insert_many([{k: v for k, v in r.items()} for r in records])
    leads = await db.leads.find({}, {"_id": 0}).to_list(1000)
    return {"message": f"Uploaded {len(records)} leads", "leads": leads}


@api_router.post("/upload-json")
async def upload_json(data: dict):
    records = data.get("records", [])
    if not records:
        return {"error": "No records provided"}

    df = process_csv_data(records)
    scores = calculate_lead_scores(df)
    await db.leads.delete_many({})

    for i, record in enumerate(records):
        record["id"] = str(uuid.uuid4())
        record["lead_score"] = scores[i]
        record["deal_value_inr"] = int(float(record.get("deal_value_inr", 0)))
        record["created_at"] = datetime.now(timezone.utc).isoformat()

    await db.leads.insert_many([{k: v for k, v in r.items()} for r in records])
    leads = await db.leads.find({}, {"_id": 0}).to_list(1000)
    return {"message": f"Uploaded {len(records)} leads", "leads": leads}


@api_router.post("/analyze")
async def analyze_data():
    """
    Main analysis endpoint.
    - Executive Summary: Gemini (with local fallback)
    - Everything else: Local AI engine (pandas/numpy)
    """
    leads = await db.leads.find({}, {"_id": 0}).to_list(1000)
    if not leads:
        return {"error": "No leads data found. Upload a CSV first."}

    df = process_csv_data(leads)
    stats = generate_statistics(df)
    risks = detect_risks(df)

    # Local AI — always works, no external dependency
    business_insights = generate_local_insights(df, stats)
    recommendations = generate_local_recommendations(df, leads)
    risk_alerts = generate_local_risk_alerts(risks)
    conversion_forecast = generate_local_conversion_forecast(stats, leads)

    # Gemini — only for executive summary, with local fallback
    executive_summary = await generate_executive_summary_gemini(stats, leads)
    if not executive_summary:
        logger.info("Gemini unavailable — using local executive summary.")
        executive_summary = generate_local_executive_summary(stats, leads)

    analysis = {
        "id": str(uuid.uuid4()),
        "executive_summary": executive_summary,
        "business_insights": business_insights,
        "recommendations": recommendations,
        "risk_alerts": risk_alerts,
        "conversion_forecast": conversion_forecast,
        "statistics": stats,
        "risks": [r for r in risks if r["risk_level"] != "low"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    await db.analysis_results.delete_many({})
    await db.analysis_results.insert_one({k: v for k, v in analysis.items()})
    analysis_clean = await db.analysis_results.find_one({}, {"_id": 0})
    return analysis_clean


@api_router.get("/analysis")
async def get_analysis():
    result = await db.analysis_results.find_one({}, {"_id": 0})
    if not result:
        return None
    return result


@api_router.get("/dashboard-stats")
async def get_dashboard_stats():
    leads = await db.leads.find({}, {"_id": 0}).to_list(1000)
    if not leads:
        return {"total_leads": 0, "total_deal_value": 0, "avg_deal_value": 0}

    df = process_csv_data(leads)
    stats = generate_statistics(df)
    scores = [lead_rec.get("lead_score", 0) for lead_rec in leads]
    stats["avg_lead_score"] = int(sum(scores) / len(scores)) if scores else 0
    stats["high_score_leads"] = sum(1 for s in scores if s >= 70)
    return stats


@api_router.post("/lead-strategy/{lead_id}")
async def get_lead_strategy(lead_id: str):
    """Local AI strategy — no Gemini dependency."""
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        return {"error": "Lead not found"}
    strategy = generate_local_strategy(lead)
    return {"lead": lead, "strategy": strategy}


@api_router.post("/outreach/{lead_id}")
async def get_outreach(lead_id: str):
    """Local AI outreach — no Gemini dependency."""
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        return {"error": "Lead not found"}
    outreach = generate_local_outreach(lead)
    return {"lead": lead, "outreach": outreach}


@api_router.get("/sample-data")
async def get_sample_data():
    return get_sample_records()


@api_router.post("/load-sample")
async def load_sample_data():
    sample = get_sample_records()
    df = process_csv_data(sample)
    scores = calculate_lead_scores(df)
    await db.leads.delete_many({})

    for i, record in enumerate(sample):
        record["id"] = str(uuid.uuid4())
        record["lead_score"] = scores[i]
        record["created_at"] = datetime.now(timezone.utc).isoformat()

    await db.leads.insert_many([{k: v for k, v in r.items()} for r in sample])
    leads = await db.leads.find({}, {"_id": 0}).to_list(1000)
    return {"message": f"Loaded {len(sample)} sample leads", "leads": leads}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
