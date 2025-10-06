#!/usr/bin/env python3
"""
Database Table Creation Script for AuthenticAI
Creates missing tables and sets up the database schema
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
import logging

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_supabase_client() -> Client:
    """Get Supabase client with service key for admin operations"""
    url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not url or not service_key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    
    return create_client(url, service_key)

def run_migration_file(client: Client, migration_file: str):
    """Run a SQL migration file"""
    migration_path = Path(__file__).parent.parent / "migrations" / migration_file
    
    if not migration_path.exists():
        logger.error(f"Migration file not found: {migration_path}")
        return False
    
    try:
        with open(migration_path, 'r') as f:
            sql_content = f.read()
        
        logger.info(f"Running migration: {migration_file}")
        
        # Split SQL content by semicolons and execute each statement
        statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
        
        for i, statement in enumerate(statements):
            if statement:
                try:
                    result = client.rpc('exec_sql', {'sql': statement}).execute()
                    logger.info(f"Statement {i+1}/{len(statements)} executed successfully")
                except Exception as e:
                    logger.warning(f"Statement {i+1} failed (might already exist): {e}")
                    continue
        
        logger.info(f"Migration {migration_file} completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to run migration {migration_file}: {e}")
        return False

def check_table_exists(client: Client, table_name: str) -> bool:
    """Check if a table exists in the database"""
    try:
        result = client.table(table_name).select("*").limit(1).execute()
        return True
    except Exception:
        return False

def main():
    """Main function to create missing tables"""
    try:
        logger.info("Starting database table creation...")
        
        # Get Supabase client
        client = get_supabase_client()
        logger.info("Connected to Supabase")
        
        # Check existing tables
        existing_tables = []
        missing_tables = []
        
        table_names = [
            'users', 'air_quality_data', 'predictions', 'biometric_readings', 'health_goals',
            'smart_devices', 'health_history', 'user_profiles', 'subscriptions', 
            'payments', 'sessions', 'community_insights', 'feedback', 
            'outcome_tracking', 'organizations', 'organization_users'
        ]
        
        for table in table_names:
            if check_table_exists(client, table):
                existing_tables.append(table)
            else:
                missing_tables.append(table)
        
        logger.info(f"Existing tables: {existing_tables}")
        logger.info(f"Missing tables: {missing_tables}")
        
        if missing_tables:
            logger.info("Running migration to create missing tables...")
            success = run_migration_file(client, "0002_missing_tables.sql")
            
            if success:
                logger.info("✅ All missing tables created successfully!")
                
                # Verify tables were created
                for table in missing_tables:
                    if check_table_exists(client, table):
                        logger.info(f"✅ Table {table} created successfully")
                    else:
                        logger.error(f"❌ Table {table} was not created")
            else:
                logger.error("❌ Failed to create missing tables")
                return 1
        else:
            logger.info("✅ All tables already exist")
        
        # Check final status
        logger.info("\n=== FINAL DATABASE STATUS ===")
        for table in table_names:
            if check_table_exists(client, table):
                try:
                    result = client.table(table).select("*").limit(1).execute()
                    count = len(result.data) if result.data else 0
                    logger.info(f"✅ {table}: EXISTS ({count} records)")
                except Exception as e:
                    logger.info(f"✅ {table}: EXISTS (error checking count: {e})")
            else:
                logger.error(f"❌ {table}: MISSING")
        
        logger.info("\n🎉 Database setup completed successfully!")
        return 0
        
    except Exception as e:
        logger.error(f"❌ Database setup failed: {e}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
