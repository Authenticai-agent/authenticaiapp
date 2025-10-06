#!/usr/bin/env python3
"""
Create test user script
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client
from passlib.context import CryptContext

# Load environment variables
load_dotenv()

def create_test_user():
    """Create a test user for testing login"""

    print("👤 Creating test user...")

    # Load environment variables
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not supabase_url or not supabase_service_key:
        print("❌ Environment variables not found")
        return

    # Initialize Supabase admin client
    supabase_admin = create_client(supabase_url, supabase_service_key)

    # Create test user data
    test_user = {
        "email": "test@example.com",
        "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/L0duKK3FzP5E3fL4q",  # "password123"
        "subscription_tier": "free",
        "full_name": "Test User"
    }

    try:
        # Check if user already exists
        result = supabase_admin.table("users").select("*").eq("email", test_user["email"]).execute()
        if result.data:
            print(f"✅ Test user already exists: {test_user['email']}")
            return test_user

        # Create user
        result = supabase_admin.table("users").insert(test_user).execute()

        if result.data:
            print(f"✅ Test user created successfully: {test_user['email']}")
            return test_user
        else:
            print("❌ Failed to create test user")
            return None

    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        return None

def test_login():
    """Test login with the created user"""

    print("\n🔐 Testing login...")

    # Load environment variables
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not supabase_url or not supabase_service_key:
        print("❌ Environment variables not found")
        return

    # Initialize Supabase admin client
    supabase_admin = create_client(supabase_url, supabase_service_key)

    try:
        # Get test user
        result = supabase_admin.table("users").select("*").eq("email", "test@example.com").execute()

        if not result.data:
            print("❌ Test user not found")
            return

        user_data = result.data[0]
        print(f"✅ Found test user: {user_data['email']}")

        # Verify password (password123)
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        if pwd_context.verify("password123", user_data["hashed_password"]):
            print("✅ Password verification successful")
        else:
            print("❌ Password verification failed")

    except Exception as e:
        print(f"❌ Error testing login: {e}")

if __name__ == "__main__":
    create_test_user()
    test_login()
