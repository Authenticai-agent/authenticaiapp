"""
Run Analytics Tables Migration
Creates analytics_events, wellness_correlations, and user_metrics tables
"""

import os
from database import get_admin_db

def run_migration():
    """Run the analytics tables migration"""
    
    print("="*60)
    print("Analytics Tables Migration")
    print("="*60)
    print()
    
    # Read the migration file
    migration_file = os.path.join(os.path.dirname(__file__), 'migrations', '0003_analytics_tables.sql')
    
    try:
        with open(migration_file, 'r') as f:
            sql = f.read()
        
        print(f"✓ Migration file loaded: {migration_file}")
        print()
        
        # Get database connection
        db = get_admin_db()
        
        # Execute the migration
        # Note: Supabase Python client doesn't support raw SQL execution
        # You need to run this SQL directly in Supabase SQL Editor
        
        print("⚠️  IMPORTANT: Supabase Python client doesn't support raw SQL execution")
        print()
        print("Please follow these steps:")
        print()
        print("1. Go to your Supabase Dashboard")
        print("   https://app.supabase.com/project/YOUR_PROJECT_ID/sql")
        print()
        print("2. Open the SQL Editor")
        print()
        print("3. Copy and paste the contents of:")
        print(f"   {migration_file}")
        print()
        print("4. Click 'Run' to execute the migration")
        print()
        print("="*60)
        print("Migration SQL Preview:")
        print("="*60)
        print()
        
        # Show first 50 lines of the migration
        lines = sql.split('\n')[:50]
        for line in lines:
            print(line)
        
        print()
        print(f"... ({len(sql.split(chr(10))) - 50} more lines)")
        print()
        print("="*60)
        print("Tables that will be created:")
        print("="*60)
        print("✓ analytics_events - Stores all user interaction events")
        print("✓ wellness_correlations - AI-discovered correlations")
        print("✓ user_metrics - Aggregated user metrics")
        print()
        print("Indexes created: 8")
        print("RLS Policies created: 9")
        print("Functions created: 2")
        print("Triggers created: 2")
        print()
        print("="*60)
        
    except FileNotFoundError:
        print(f"❌ Migration file not found: {migration_file}")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    run_migration()
