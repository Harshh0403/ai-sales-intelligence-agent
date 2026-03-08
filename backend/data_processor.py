import pandas as pd
import numpy as np
from datetime import datetime


def process_csv_data(records: list) -> pd.DataFrame:
    df = pd.DataFrame(records)
    if "deal_value_inr" in df.columns:
        df["deal_value_inr"] = pd.to_numeric(df["deal_value_inr"], errors="coerce").fillna(0).astype(int)
    if "last_contact_date" in df.columns:
        df["last_contact_date"] = pd.to_datetime(df["last_contact_date"], errors="coerce")
    return df


def calculate_lead_scores(df: pd.DataFrame) -> list:
    scores = []
    today = datetime.now()

    for _, row in df.iterrows():
        score = 50  # base

        # Interest level factor
        interest = str(row.get("interest_level", "")).strip().lower()
        if interest == "high":
            score += 25
        elif interest == "medium":
            score += 10
        else:
            score -= 10

        # Deal value factor
        deal_val = float(row.get("deal_value_inr", 0))
        if deal_val >= 500000:
            score += 15
        elif deal_val >= 200000:
            score += 10
        elif deal_val >= 50000:
            score += 5

        # Recency factor
        last_contact = row.get("last_contact_date")
        if pd.notna(last_contact):
            if isinstance(last_contact, str):
                try:
                    last_contact = datetime.strptime(last_contact, "%Y-%m-%d")
                except ValueError:
                    last_contact = None
            if last_contact:
                days_since = (today - last_contact).days
                if days_since <= 7:
                    score += 15
                elif days_since <= 14:
                    score += 8
                elif days_since <= 30:
                    score += 2
                else:
                    score -= 10

        # Notes engagement factor
        notes = str(row.get("notes", "")).lower()
        if any(w in notes for w in ["ready to sign", "budget approved", "poc completed"]):
            score += 10
        elif any(w in notes for w in ["demo", "impressed", "upgrade"]):
            score += 5
        elif any(w in notes for w in ["competitor", "budget constraints"]):
            score -= 5

        scores.append(max(0, min(100, score)))

    return scores


def detect_risks(df: pd.DataFrame) -> list:
    risks = []
    today = datetime.now()

    for _, row in df.iterrows():
        lead_risks = []
        last_contact = row.get("last_contact_date")
        if pd.notna(last_contact):
            if isinstance(last_contact, str):
                try:
                    last_contact = datetime.strptime(last_contact, "%Y-%m-%d")
                except ValueError:
                    last_contact = None
            if last_contact:
                days_since = (today - last_contact).days
                if days_since > 30:
                    lead_risks.append(f"Inactive for {days_since} days - high risk of losing lead")
                elif days_since > 14:
                    lead_risks.append(f"No contact in {days_since} days - needs follow-up")

        notes = str(row.get("notes", "")).lower()
        if "competitor" in notes:
            lead_risks.append("Evaluating competitors - risk of switching")
        if "budget constraints" in notes:
            lead_risks.append("Budget constraints - may delay or cancel")
        if "leave" in notes or "waiting" in notes:
            lead_risks.append("Decision delayed - momentum at risk")

        risk_level = "low"
        if len(lead_risks) >= 2:
            risk_level = "high"
        elif len(lead_risks) == 1:
            risk_level = "medium"

        risks.append({
            "lead_name": row.get("lead_name", "Unknown"),
            "company": row.get("company", "Unknown"),
            "risk_level": risk_level,
            "risk_factors": lead_risks
        })

    return risks


def generate_statistics(df: pd.DataFrame) -> dict:
    stats = {}

    # Overall stats
    stats["total_leads"] = len(df)
    stats["total_deal_value"] = int(df.get("deal_value_inr", pd.Series([0])).sum())
    stats["avg_deal_value"] = int(df.get("deal_value_inr", pd.Series([0])).mean())

    # Interest distribution
    if "interest_level" in df.columns:
        interest_counts = df["interest_level"].value_counts().to_dict()
        stats["interest_distribution"] = {str(k): int(v) for k, v in interest_counts.items()}

    # Region distribution
    if "region" in df.columns:
        region_counts = df["region"].value_counts().to_dict()
        stats["region_distribution"] = {str(k): int(v) for k, v in region_counts.items()}

    # Industry distribution
    if "industry" in df.columns:
        industry_counts = df["industry"].value_counts().to_dict()
        stats["industry_distribution"] = {str(k): int(v) for k, v in industry_counts.items()}

    # Product distribution
    if "interested_product" in df.columns:
        product_counts = df["interested_product"].value_counts().to_dict()
        stats["product_distribution"] = {str(k): int(v) for k, v in product_counts.items()}

    # Deal value by region
    if "region" in df.columns and "deal_value_inr" in df.columns:
        region_deals = df.groupby("region")["deal_value_inr"].sum().to_dict()
        stats["deal_value_by_region"] = {str(k): int(v) for k, v in region_deals.items()}

    # Deal value by industry
    if "industry" in df.columns and "deal_value_inr" in df.columns:
        industry_deals = df.groupby("industry")["deal_value_inr"].agg(["sum", "mean", "count"]).to_dict("index")
        stats["deal_value_by_industry"] = {
            str(k): {"total": int(v["sum"]), "avg": int(v["mean"]), "count": int(v["count"])}
            for k, v in industry_deals.items()
        }

    # High value leads (>500k)
    if "deal_value_inr" in df.columns:
        stats["high_value_count"] = int((df["deal_value_inr"] >= 500000).sum())
        stats["conversion_ready"] = int(
            ((df.get("interest_level", pd.Series()) == "High") &
             (df.get("deal_value_inr", pd.Series([0])) >= 200000)).sum()
        )

    return stats


def format_inr(value: int) -> str:
    s = str(value)
    if len(s) <= 3:
        return f"₹{s}"
    last_three = s[-3:]
    rest = s[:-3]
    formatted = ""
    while len(rest) > 2:
        formatted = "," + rest[-2:] + formatted
        rest = rest[:-2]
    formatted = rest + formatted
    return f"₹{formatted},{last_three}"
