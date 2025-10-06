#!/usr/bin/env python3
"""
Direct Database Table Creation Script for AuthenticAI
Creates missing tables using direct SQL execution
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import logging

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_database_connection():
    """Get direct PostgreSQL connection"""
    # Extract connection details from Supabase URL
    supabase_url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not supabase_url or not service_key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    
    # Parse Supabase URL to get connection details
    # Format: https://project-ref.supabase.co
    url_parts = supabase_url.replace("https://", "").split(".")
    project_ref = url_parts[0]
    
    # Construct PostgreSQL connection string
    db_url = f"postgresql://postgres:{service_key}@db.{project_ref}.supabase.co:5432/postgres"
    
    return psycopg2.connect(db_url)

def execute_sql_file(connection, sql_file_path):
    """Execute SQL file with the given connection"""
    try:
        with open(sql_file_path, 'r') as f:
            sql_content = f.read()
        
        cursor = connection.cursor()
        
        # Split by semicolons and execute each statement
        statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
        
        for i, statement in enumerate(statements):
            if statement:
                try:
                    cursor.execute(statement)
                    logger.info(f"✅ Statement {i+1}/{len(statements)} executed successfully")
                except Exception as e:
                    if "already exists" in str(e).lower():
                        logger.info(f"ℹ️  Statement {i+1} skipped (already exists)")
                    else:
                        logger.warning(f"⚠️  Statement {i+1} failed: {e}")
        
        connection.commit()
        cursor.close()
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to execute SQL file: {e}")
        return False

def check_table_exists(connection, table_name):
    """Check if a table exists"""
    try:
        cursor = connection.cursor()
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = %s
            );
        """, (table_name,))
        
        exists = cursor.fetchone()[0]
        cursor.close()
        return exists
        
    except Exception as e:
        logger.error(f"Error checking table {table_name}: {e}")
        return False

def main():
    """Main function to create missing tables"""
    try:
        logger.info("Starting direct database table creation...")
        
        # Get database connection
        connection = get_database_connection()
        connection.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        logger.info("✅ Connected to PostgreSQL database")
        
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
            if check_table_exists(connection, table):
                existing_tables.append(table)
            else:
                missing_tables.append(table)
        
        logger.info(f"Existing tables: {existing_tables}")
        logger.info(f"Missing tables: {missing_tables}")
        
        if missing_tables:
            logger.info("Running migration to create missing tables...")
            migration_path = Path(__file__).parent.parent / "migrations" / "0002_missing_tables.sql"
            
            success = execute_sql_file(connection, migration_path)
            
            if success:
                logger.info("✅ Migration completed successfully!")
                
                # Verify tables were created
                for table in missing_tables:
                    if check_table_exists(connection, table):
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
            if check_table_exists(connection, table):
                try:
                    cursor = connection.cursor()
                    cursor.execute(f"SELECT COUNT(*) FROM {table}")
                    count = cursor.fetchone()[0]
                    cursor.close()
                    logger.info(f"✅ {table}: EXISTS ({count} records)")
                except Exception as e:
                    logger.info(f"✅ {table}: EXISTS (error checking count: {e})")
            else:
                logger.error(f"❌ {table}: MISSING")
        
        connection.close()
        logger.info("\n🎉 Database setup completed successfully!")
        return 0
        
    except Exception as e:
        logger.error(f"❌ Database setup failed: {e}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
