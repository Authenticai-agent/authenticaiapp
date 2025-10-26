"""
Migration script: Convert medical fields to wellness fields
Converts the database from medical/PHI tracking to wellness coaching
"""
import sys
sys.path.insert(0, '.')

from database import get_admin_db
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

def migrate_to_wellness():
    """Migrate database schema from medical to wellness"""
    
    print("🔄 Starting wellness migration...")
    
    # Get Supabase admin client
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set")
        return False
    
    db = get_admin_db()
    
    # SQL to add new wellness columns
    migrations = [
        # Add new wellness fields
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS age_range TEXT;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS environmental_sensitivities TEXT[] DEFAULT '{}';",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS respiratory_sensitivity TEXT;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS known_triggers TEXT[] DEFAULT '{}';",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS uses_air_purifier BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS uses_rescue_inhaler BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS outdoor_activity_level TEXT;",
        
        # Migrate data from old fields to new fields
        """
        UPDATE users 
        SET age_range = CASE 
            WHEN age < 26 THEN '18-25'
            WHEN age < 36 THEN '26-35'
            WHEN age < 51 THEN '36-50'
            WHEN age < 66 THEN '51-65'
            ELSE '65+'
        END
        WHERE age IS NOT NULL AND age_range IS NULL;
        """,
        
        """
        UPDATE users
        SET respiratory_sensitivity = CASE
            WHEN asthma_severity = 'severe' THEN 'high'
            WHEN asthma_severity = 'moderate' THEN 'moderate'
            WHEN asthma_severity = 'mild' THEN 'low'
            ELSE 'none'
        END
        WHERE asthma_severity IS NOT NULL AND respiratory_sensitivity IS NULL;
        """,
        
        """
        UPDATE users
        SET environmental_sensitivities = COALESCE(allergies, '{}')
        WHERE environmental_sensitivities = '{}' AND allergies IS NOT NULL;
        """,
        
        """
        UPDATE users
        SET known_triggers = COALESCE(triggers, '{}')
        WHERE known_triggers = '{}' AND triggers IS NOT NULL;
        """,
    ]
    
    print("📝 Executing migrations...")
    
    try:
        # Note: Supabase Python client doesn't support raw SQL directly
        # You'll need to run these in the Supabase SQL editor or use psycopg2
        print("\n⚠️  Please run these SQL commands in your Supabase SQL editor:\n")
        for i, migration in enumerate(migrations, 1):
            print(f"-- Migration {i}")
            print(migration)
            print()
        
        print("\n✅ Migration SQL generated!")
        print("\n📋 Next steps:")
        print("1. Go to your Supabase dashboard")
        print("2. Open the SQL Editor")
        print("3. Copy and paste the SQL commands above")
        print("4. Run them one by one")
        print("\nOr run this script with psycopg2 to execute automatically.")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    migrate_to_wellness()
