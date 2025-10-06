#!/usr/bin/env python3
"""
Database connection test script
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def test_database_connection():
    """Test database connections"""

    print("🔍 Testing database connections...")

    # Load environment variables
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not supabase_url:
        print("❌ SUPABASE_URL not found in environment variables")
        return
    if not supabase_key:
        print("❌ SUPABASE_KEY not found in environment variables")
        return
    if not supabase_service_key:
        print("❌ SUPABASE_SERVICE_KEY not found in environment variables")
        return

    print(f"SUPABASE_URL: {supabase_url}")
    print(f"SUPABASE_KEY: {supabase_key[:20]}...")
    print(f"SUPABASE_SERVICE_KEY: {supabase_service_key[:20]}...")

    # Test regular client
    try:
        print("\n📡 Testing regular Supabase client...")
        supabase = create_client(supabase_url, supabase_key)
        result = supabase.table("users").select("count").execute()
        print("✅ Regular client connection successful")
    except Exception as e:
        print(f"❌ Regular client connection failed: {e}")

    # Test admin client
    try:
        print("\n🔧 Testing admin Supabase client...")
        supabase_admin = create_client(supabase_url, supabase_service_key)
        result = supabase_admin.table("users").select("count").execute()
        print("✅ Admin client connection successful")
    except Exception as e:
        print(f"❌ Admin client connection failed: {e}")

    # Test user table schema
    try:
        print("\n📋 Testing user table schema...")
        supabase_admin = create_client(supabase_url, supabase_service_key)
        result = supabase_admin.table("users").select("*").limit(1).execute()
        if result.data:
            print("✅ User table exists and has data")
            print(f"   Columns: {list(result.data[0].keys())}")
        else:
            print("✅ User table exists but is empty")
    except Exception as e:
        print(f"❌ User table test failed: {e}")

if __name__ == "__main__":
    test_database_connection()
