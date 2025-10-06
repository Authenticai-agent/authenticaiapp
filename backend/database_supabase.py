"""
Supabase Database Connection for AuthenticAI
"""

from supabase import create_client, Client
import os
from typing import Optional
import logging
from dotenv import load_dotenv

load_dotenv()
logger = setup_logger()

# Supabase clients
supabase: Optional[Client] = None
supabase_admin: Optional[Client] = None

async def init_db():
    """Initialize Supabase database connection"""
    global supabase, supabase_admin
    
    url = os.getenv("SUPABASE_URL")
    anon_key = os.getenv("SUPABASE_KEY")
    service_key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not url or not anon_key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")
    
    # Regular client for authenticated operations
    supabase = create_client(url, anon_key)
    
    # Admin client for bypassing RLS (user registration, etc.)
    if service_key:
        supabase_admin = create_client(url, service_key)
        logger.info("Database connection initialized with admin client")
    else:
        supabase_admin = supabase
        logger.warning("SUPABASE_SERVICE_KEY not set, using anon key for admin operations")
    
    logger.info("Supabase connection initialized successfully")
    
    # Test the connection
    try:
        admin_db = get_admin_db()
        result = admin_db.table("users").select("email").limit(1).execute()
        if not result.data:
            # Create test user if no users exist
            test_user = {
                "email": "test@example.com",
                "hashed_password": "$2b$12$L0duKK3FzP5E3fL4qhashedpassword123",
                "full_name": "Test User",
                "subscription_tier": "free"
            }
            admin_db.table("users").insert(test_user).execute()
            logger.info("Test user created")
    except Exception as e:
        logger.warning(f"Could not create test user: {e}")

def get_db() -> Client:
    """Get database client"""
    if supabase is None:
        raise RuntimeError("Database not initialized")
    return supabase

def get_admin_db() -> Client:
    """Get admin database client for operations that bypass RLS"""
    if supabase_admin is None:
        raise RuntimeError("Database not initialized")
    return supabase_admin

# Initialize database on import
try:
    import asyncio
    asyncio.run(init_db())
    logger.info("AuthenticAI Supabase database ready")
except Exception as e:
    logger.error(f"Database initialization failed: {e}")
    logger.warning("Application may not function properly without database")
