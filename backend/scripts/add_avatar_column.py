"""
Add avatar column to users table in Supabase
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

def add_avatar_column():
    """Add avatar column to users table"""
    url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not url or not service_key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    
    supabase: Client = create_client(url, service_key)
    
    # Use raw SQL to add column if it doesn't exist
    # Note: Supabase Python client doesn't support ALTER TABLE directly
    # You'll need to run this SQL in Supabase SQL Editor:
    
    sql = """
    -- Add avatar column if it doesn't exist
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'avatar'
        ) THEN
            ALTER TABLE users ADD COLUMN avatar TEXT;
        END IF;
    END $$;
    """
    
    print("=" * 60)
    print("SUPABASE SQL MIGRATION")
    print("=" * 60)
    print("\nPlease run this SQL in your Supabase SQL Editor:")
    print("\n" + sql)
    print("\nSteps:")
    print("1. Go to https://supabase.com/dashboard")
    print("2. Select your project")
    print("3. Go to SQL Editor")
    print("4. Paste the SQL above")
    print("5. Click 'Run'")
    print("\nThis will add the 'avatar' column to the users table.")
    print("=" * 60)

if __name__ == "__main__":
    add_avatar_column()
