import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

ENJAY_PRODUCTS = [
    "Sangam CRM",
    "Samvad Telecaller",
    "Synapse Call Centre",
    "Sarathi Field Tracker",
    "WhatsApp Marketing System",
    "Customer Support Suite",
    "Sales Automation Tools"
]

INDIAN_COMPANIES = [
    "TechNova Pvt Ltd", "ABC Pvt Ltd", "Infosys Technologies", "Wipro Digital",
    "Reliance Industries", "Tata Consultancy", "Mahindra Group", "Bharti Airtel",
    "Godrej Enterprises", "Larsen & Toubro", "Aditya Birla Group", "HCL Technologies",
    "Sun Pharma Industries", "Bajaj Finserv", "Kotak Mahindra", "ICICI Ventures",
    "Adani Enterprises", "JSW Steel", "Hero MotoCorp", "Maruti Suzuki",
    "Cipla Pharmaceuticals", "Dr Reddy Labs", "Zee Entertainment", "Asian Paints",
    "Titan Industries", "Hindustan Unilever", "ITC Limited", "Dalmia Bharat",
    "Vedanta Resources", "Power Grid Corp", "Bharat Electronics", "NTPC Limited",
    "Coal India Ltd", "Grasim Industries", "Shree Cement", "UltraTech Cement",
    "Nestle India", "Britannia Industries", "Dabur India", "Marico Limited"
]

LEAD_NAMES = [
    "Rahul Sharma", "Priya Patel", "Amit Kumar", "Sneha Reddy",
    "Vikram Singh", "Anjali Desai", "Rajesh Gupta", "Meera Nair",
    "Suresh Iyer", "Deepa Joshi", "Arjun Malhotra", "Kavita Saxena",
    "Manish Agarwal", "Pooja Verma", "Nikhil Banerjee", "Ritu Kapoor",
    "Sanjay Mehta", "Ananya Bose", "Kiran Rao", "Vivek Choudhary",
    "Nisha Pillai", "Rohit Tiwari", "Swati Bhatt", "Gaurav Mishra",
    "Divya Menon", "Arun Sinha", "Lakshmi Narayanan", "Harsh Pandey",
    "Rekha Kulkarni", "Ashok Thakur", "Sunita Hegde", "Prakash Shetty",
    "Madhuri Patil", "Ramesh Nair", "Jyoti Kaur", "Vinod Chopra",
    "Usha Raghavan", "Tarun Khanna", "Geeta Deshpande", "Aniket Jain"
]

INDUSTRIES = [
    "IT Services", "Manufacturing", "Healthcare", "Finance",
    "Retail", "Education", "Real Estate", "Telecom",
    "Pharma", "FMCG", "Automotive", "Energy"
]

REGIONS = ["North", "South", "East", "West", "Central"]

NOTES_TEMPLATES = [
    "Interested in {product} for team of {size} people. Budget approved.",
    "Had a demo call. Very impressed with {product}. Needs pricing details.",
    "Follow-up required. Decision maker is on leave until next week.",
    "Competitor evaluation in progress. Needs comparison document for {product}.",
    "Ready to sign. Waiting for legal team approval.",
    "Initial inquiry about {product}. Needs product brochure.",
    "Long-term customer. Looking to upgrade to {product}.",
    "Referred by existing customer. High potential for {product}.",
    "Budget constraints. May need flexible payment plan for {product}.",
    "Multiple departments interested in {product}. Enterprise deal potential.",
    "POC completed successfully for {product}. Moving to procurement.",
    "Had meeting with CTO. Technical evaluation positive for {product}.",
    "Attended webinar on {product}. Requested callback.",
    "Existing user of competitor. Unhappy with service. Open to {product}.",
    "Startup with growing team. Needs scalable solution like {product}."
]


def generate_sample_dataset(num_leads=40):
    random.seed(42)
    np.random.seed(42)

    data = []
    today = datetime.now()

    for i in range(num_leads):
        product = random.choice(ENJAY_PRODUCTS)
        interest = random.choice(["High", "Medium", "Low"])
        region = random.choice(REGIONS)

        if interest == "High":
            deal_value = random.randint(200000, 1500000)
            days_since = random.randint(1, 10)
        elif interest == "Medium":
            deal_value = random.randint(50000, 500000)
            days_since = random.randint(5, 30)
        else:
            deal_value = random.randint(10000, 200000)
            days_since = random.randint(15, 90)

        note_template = random.choice(NOTES_TEMPLATES)
        note = note_template.format(
            product=product,
            size=random.choice([10, 25, 50, 100, 200, 500])
        )

        data.append({
            "lead_name": LEAD_NAMES[i % len(LEAD_NAMES)],
            "company": INDIAN_COMPANIES[i % len(INDIAN_COMPANIES)],
            "industry": random.choice(INDUSTRIES),
            "interest_level": interest,
            "deal_value_inr": deal_value,
            "last_contact_date": (today - timedelta(days=days_since)).strftime("%Y-%m-%d"),
            "notes": note,
            "region": region,
            "interested_product": product
        })

    return pd.DataFrame(data)


def get_sample_csv_string():
    df = generate_sample_dataset()
    return df.to_csv(index=False)


def get_sample_records():
    df = generate_sample_dataset()
    return df.to_dict(orient="records")
