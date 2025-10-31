#!/usr/bin/env python3
"""
Run saved_locations table migration
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def run_migration():
    """Run the saved_locations table migration"""
    
    # Get Supabase credentials
    url = os.getenv('SUPABASE_URL')
    service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_SERVICE_KEY')
    
    if not url or not service_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
        return False
    
    try:
        # Create Supabase client with service key
        supabase: Client = create_client(url, service_key)
        
        # Read migration file
        with open('migrations/create_saved_locations_table.sql', 'r') as f:
            sql = f.read()
        
        print("📝 Running saved_locations table migration...")
        
        # Execute migration (Note: Supabase Python client doesn't support raw SQL)
        # You need to run this SQL manually in Supabase SQL Editor
        print("\n" + "="*60)
        print("⚠️  MANUAL STEP REQUIRED:")
        print("="*60)
        print("\n1. Go to Supabase Dashboard → SQL Editor")
        print("2. Copy and paste the SQL below:")
        print("\n" + "="*60)
        print(sql)
        print("="*60)
        print("\n3. Click 'Run' to execute the migration")
        print("\n✅ After running the SQL, the saved_locations feature will work!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    run_migration()
