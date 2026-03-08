#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class AIIntelligenceAPITester:
    def __init__(self, base_url="https://crm-ai-hub-3.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.base_url}/api{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    resp_json = response.json()
                    if isinstance(resp_json, dict):
                        if len(str(resp_json)) > 500:
                            print(f"   Response: Large response received ({len(str(resp_json))} chars)")
                        else:
                            print(f"   Response keys: {list(resp_json.keys()) if resp_json else 'Empty'}")
                    elif isinstance(resp_json, list):
                        print(f"   Response: List with {len(resp_json)} items")
                except:
                    print(f"   Response: Non-JSON or empty")
            else:
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200] if hasattr(response, 'text') else 'No response text'
                })
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            return success, response.json() if success and response.content else {}

        except requests.exceptions.Timeout:
            self.failed_tests.append({'name': name, 'error': 'Request timeout'})
            print(f"❌ FAILED - Request timeout after {timeout}s")
            return False, {}
        except Exception as e:
            self.failed_tests.append({'name': name, 'error': str(e)})
            print(f"❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test the root health endpoint"""
        return self.run_test("Health Check", "GET", "/", 200)

    def test_get_leads(self):
        """Test getting leads (auto-loads sample data if empty)"""
        return self.run_test("Get Leads", "GET", "/leads", 200)

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        return self.run_test("Dashboard Stats", "GET", "/dashboard-stats", 200)

    def test_load_sample_data(self):
        """Test loading 40 sample leads"""
        return self.run_test("Load Sample Data", "POST", "/load-sample", 200, timeout=15)

    def test_ai_analysis(self):
        """Test Gemini AI analysis - longer timeout for AI processing"""
        print("⚠️  This test may take 10-20 seconds for Gemini AI processing...")
        return self.run_test("AI Analysis", "POST", "/analyze", 200, timeout=30)

    def test_lead_strategy(self, lead_id):
        """Test AI lead strategy generation"""
        print("⚠️  This test may take 5-15 seconds for Gemini AI processing...")
        return self.run_test(f"Lead Strategy", "POST", f"/lead-strategy/{lead_id}", 200, timeout=20)

    def test_outreach_generation(self, lead_id):
        """Test AI outreach generation"""
        print("⚠️  This test may take 5-15 seconds for Gemini AI processing...")
        return self.run_test(f"Outreach Generation", "POST", f"/outreach/{lead_id}", 200, timeout=20)

    def test_get_analysis(self):
        """Test getting stored analysis results"""
        return self.run_test("Get Analysis Results", "GET", "/analysis", 200)

    def print_summary(self):
        """Print test results summary"""
        print("\n" + "="*70)
        print("🧪 AI SALES INTELLIGENCE API TEST RESULTS")
        print("="*70)
        print(f"📊 Tests passed: {self.tests_passed}/{self.tests_run}")
        print(f"📈 Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests ({len(self.failed_tests)}):")
            for i, failure in enumerate(self.failed_tests, 1):
                print(f"   {i}. {failure['name']}")
                if 'expected' in failure:
                    print(f"      Expected: {failure['expected']}, Got: {failure['actual']}")
                if 'error' in failure:
                    print(f"      Error: {failure['error']}")
                if 'response' in failure:
                    print(f"      Response: {failure['response']}")
        
        return self.tests_passed == self.tests_run

def main():
    print("🚀 Starting AI Sales Intelligence API Testing...")
    print("⏱️  Note: AI-related tests may take longer due to Gemini processing")
    
    tester = AIIntelligenceAPITester()

    # Test basic endpoints first
    health_success, _ = tester.test_health_check()
    if not health_success:
        print("❌ Health check failed - API may be down")
        tester.print_summary()
        return 1

    # Test data endpoints
    leads_success, leads_data = tester.test_get_leads()
    tester.test_dashboard_stats()
    
    # Load sample data if needed
    if leads_success and isinstance(leads_data, list) and len(leads_data) < 40:
        print("📋 Loading sample data for testing...")
        tester.test_load_sample_data()
        time.sleep(2)  # Wait for data to be processed
        leads_success, leads_data = tester.test_get_leads()

    # Test AI features if we have leads
    if leads_success and isinstance(leads_data, list) and len(leads_data) > 0:
        print(f"🎯 Found {len(leads_data)} leads for AI testing...")
        
        # Test AI analysis
        analysis_success, _ = tester.test_ai_analysis()
        
        # Test analysis retrieval
        tester.test_get_analysis()
        
        # Test lead-specific AI features with first lead
        if leads_data:
            first_lead = leads_data[0]
            lead_id = first_lead.get('id')
            if lead_id:
                tester.test_lead_strategy(lead_id)
                tester.test_outreach_generation(lead_id)
            else:
                print("⚠️ No lead ID found, skipping lead-specific tests")
    else:
        print("⚠️ No leads found, skipping AI-dependent tests")

    # Print final results
    all_passed = tester.print_summary()
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())