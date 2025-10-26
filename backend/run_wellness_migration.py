"""
Automated migration script: Add wellness columns to users table
"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def run_migration():
    """Run the wellness migration automatically"""
    
    print("🔄 Starting automated wellness migration...")
    
    # Get database URL from Supabase
    supabase_url = os.getenv("SUPABASE_URL")
    
    if not supabase_url:
        print("❌ Error: SUPABASE_URL not found in .env")
        return False
    
    # Extract project ref from URL (e.g., mvzedizusolvyzqddevm)
    project_ref = supabase_url.replace("https://", "").replace(".supabase.co", "")
    
    # Construct PostgreSQL connection string
    # Format: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
    db_password = os.getenv("SUPABASE_DB_PASSWORD") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not db_password:
        print("❌ Error: Need SUPABASE_DB_PASSWORD or SUPABASE_SERVICE_ROLE_KEY")
        print("💡 Get your database password from Supabase Dashboard → Settings → Database")
        return False
    
    conn_string = f"postgresql://postgres.{project_ref}:{db_password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
    
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
    
    try:
        print(f"📡 Connecting to database...")
        conn = psycopg2.connect(conn_string)
        cursor = conn.cursor()
        
        print("✅ Connected!")
        print(f"📝 Running {len(migrations)} migrations...\n")
        
        for i, migration in enumerate(migrations, 1):
            print(f"Migration {i}/{len(migrations)}...")
            cursor.execute(migration)
            conn.commit()
            print(f"  ✅ Done")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 Migration completed successfully!")
        print("✅ New wellness columns added to users table")
        print("✅ Data migrated from old medical fields")
        print("\n💡 You can now save your profile!")
        
        return True
        
    except psycopg2.OperationalError as e:
        if "password authentication failed" in str(e):
            print("\n❌ Database password incorrect!")
            print("\n📋 To get your database password:")
            print("1. Go to https://supabase.com/dashboard")
            print("2. Select your project")
            print("3. Go to Settings → Database")
            print("4. Copy the password")
            print("5. Add to .env: SUPABASE_DB_PASSWORD=your_password")
        else:
            print(f"❌ Connection error: {e}")
        return False
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    run_migration()
