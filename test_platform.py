#!/usr/bin/env python3
"""
Comprehensive Test Suite for AuthenticAI Platform
Tests all major functionality end-to-end
"""

import os
import sys
import time
import json
import requests
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AuthenticAITester:
    def __init__(self):
        self.base_url = os.getenv("REACT_APP_API_URL", "http://localhost:8000/api/v1")
        self.session = requests.Session()
        self.test_user = None

    def log(self, message: str, status: str = "INFO"):
        """Log a test message"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {status}: {message}")

    def test_health_check(self) -> bool:
        """Test basic health check endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                self.log("Health check passed", "✅")
                return True
            else:
                self.log(f"Health check failed: {response.status_code}", "❌")
                return False
        except Exception as e:
            self.log(f"Health check error: {e}", "❌")
            return False

    def test_user_registration(self) -> bool:
        """Test user registration"""
        try:
            # Use timestamp-based unique email to avoid conflicts
            timestamp = int(time.time())
            user_data = {
                "email": f"test_user_{timestamp}@authenticai-test.com",
                "password": "SecureTestPass123!",
                "first_name": "Test",
                "last_name": "User"
            }

            response = self.session.post(f"{self.base_url}/auth/register", json=user_data)

            if response.status_code == 200:
                token_data = response.json()
                self.session.headers.update({"Authorization": f"Bearer {token_data['access_token']}"})
                self.test_user = user_data
                self.log("User registration successful", "✅")
                return True
            else:
                self.log(f"User registration failed: {response.text}", "❌")
                return False
        except Exception as e:
            self.log(f"User registration error: {e}", "❌")
            return False

    def test_user_login(self) -> bool:
        """Test user login"""
        try:
            # Login user
            login_data = {
                "email": self.test_user["email"],
                "password": self.test_user["password"]
            }

            response = self.session.post(f"{self.base_url}/auth/login", json=login_data)

            if response.status_code == 200:
                token_data = response.json()
                self.session.headers.update({"Authorization": f"Bearer {token_data['access_token']}"})
                self.log("User login successful", "✅")
                return True
            else:
                self.log(f"User login failed: {response.text}", "❌")
                return False
        except Exception as e:
            self.log(f"User login error: {e}", "❌")
            return False

    def test_user_profile(self) -> bool:
        """Test user profile access"""
        try:
            response = self.session.get(f"{self.base_url}/auth/me")

            if response.status_code == 200:
                profile_data = response.json()
                self.log(f"Profile access successful: {profile_data.get('email', 'N/A')}", "✅")
                return True
            else:
                self.log(f"Profile access failed: {response.text}", "❌")
                return False
        except Exception as e:
            self.log(f"Profile access error: {e}", "❌")
            return False

    def test_air_quality_api(self) -> bool:
        """Test air quality API"""
        try:
            # Test current air quality
            response = self.session.get(f"{self.base_url}/air-quality/current?lat=40.7128&lon=-74.0060")

            if response.status_code == 200:
                data = response.json()
                self.log(f"Air quality API successful: AQI {data.get('aqi', 'N/A')}", "✅")
                return True
            else:
                self.log(f"Air quality API failed: {response.text}", "❌")
                return False
        except Exception as e:
            self.log(f"Air quality API error: {e}", "❌")
            return False

    def test_predictions_api(self) -> bool:
        """Test predictions API"""
        try:
            response = self.session.get(f"{self.base_url}/predictions/flareup-risk")

            if response.status_code == 200:
                data = response.json()
                self.log(f"Predictions API successful: Risk {data.get('risk_level', 'N/A')}", "✅")
                return True
            else:
                self.log(f"Predictions API failed: {response.text}", "❌")
                return False
        except Exception as e:
            self.log(f"Predictions API error: {e}", "❌")
            return False

    def test_premium_features(self) -> bool:
        """Test premium features"""
        try:
            # Test personal risk prediction
            response = self.session.get(f"{self.base_url}/predictions/premium/personal-risk")

            if response.status_code == 200:
                data = response.json()
                self.log(f"Premium risk prediction successful: Score {data.get('risk_score', 'N/A')}", "✅")
                return True
            elif response.status_code == 402:
                self.log("Premium features require subscription (expected)", "⚠️")
                return True
            else:
                self.log(f"Premium features failed: {response.text}", "❌")
                return False
        except Exception as e:
            self.log(f"Premium features error: {e}", "❌")
            return False

    def test_gamification_api(self) -> bool:
        """Test gamification API"""
        try:
            response = self.session.get(f"{self.base_url}/gamification/stats")

            if response.status_code == 200:
                data = response.json()
                self.log(f"Gamification API successful: Level {data.get('current_level', 'N/A')}", "✅")
                return True
            else:
                self.log(f"Gamification API failed: {response.text}", "❌")
                return False
        except Exception as e:
            self.log(f"Gamification API error: {e}", "❌")
            return False

    def test_privacy_api(self) -> bool:
        """Test privacy API"""
        try:
            response = self.session.get(f"{self.base_url}/privacy/settings")

            if response.status_code == 200:
                data = response.json()
                self.log("Privacy API successful", "✅")
                return True
            else:
                self.log(f"Privacy API failed: {response.text}", "❌")
                return False
        except Exception as e:
            self.log(f"Privacy API error: {e}", "❌")
            return False

    def test_coaching_api(self) -> bool:
        """Test coaching API"""
        try:
            response = self.session.post(f"{self.base_url}/coaching/daily-briefing")

            if response.status_code == 200:
                data = response.json()
                self.log("Coaching API successful", "✅")
                return True
            else:
                self.log(f"Coaching API failed: {response.text}", "❌")
                return False
        except Exception as e:
            self.log(f"Coaching API error: {e}", "❌")
            return False

    def run_all_tests(self) -> bool:
        """Run all tests and return overall success"""
        tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("User Profile", self.test_user_profile),
            ("Air Quality API", self.test_air_quality_api),
            ("Predictions API", self.test_predictions_api),
            ("Premium Features", self.test_premium_features),
            ("Gamification API", self.test_gamification_api),
            ("Privacy API", self.test_privacy_api),
            ("Coaching API", self.test_coaching_api),
        ]

        passed = 0
        total = len(tests)

        print("🧪 Starting AuthenticAI Test Suite...")
        print("=" * 50)

        for test_name, test_func in tests:
            print(f"\n🔍 Testing {test_name}...")
            if test_func():
                passed += 1

        print("\n" + "=" * 50)
        print(f"📊 Test Results: {passed}/{total} tests passed")

        if passed == total:
            print("🎉 All tests passed! Platform is ready for production.")
            return True
        else:
            print(f"⚠️ {total - passed} tests failed. Check logs for details.")
            return False

def main():
    """Main test runner"""
    tester = AuthenticAITester()
    success = tester.run_all_tests()

    if success:
        print("\n✅ Platform is production-ready!")
        sys.exit(0)
    else:
        print("\n❌ Platform needs fixes before production deployment.")
        sys.exit(1)

if __name__ == "__main__":
    main()
