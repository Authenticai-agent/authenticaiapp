"""
Supabase Database Connection for AuthenticAI
"""

from supabase import create_client, Client
import os
from typing import Optional
import logging
from dotenv import load_dotenv

load_dotenv()

# Supabase clients
supabase: Optional[Client] = None
supabase_admin: Optional[Client] = None

def init_db():
    """Initialize Supabase database connection"""
    global supabase, supabase_admin

    url = os.getenv("SUPABASE_URL")
    anon_key = os.getenv("SUPABASE_KEY")
    service_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not url or not anon_key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")

    try:
        # Regular client for authenticated operations
        supabase = create_client(url, anon_key)

        # Admin client for bypassing RLS (user registration, etc.)
        if service_key:
            supabase_admin = create_client(url, service_key)
            logging.info("Database connection initialized with admin client")
        else:
            supabase_admin = supabase
            logging.warning("SUPABASE_SERVICE_KEY not set, using anon key for admin operations")

        logging.info("Supabase connection initialized successfully")

    except Exception as e:
        logging.error(f"Failed to initialize Supabase: {e}")
        raise

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

# Initialize database on import (but don't use asyncio.run)
try:
    init_db()
    logging.info("AuthenticAI Supabase database ready")
except Exception as e:
    # Raise to fail fast on startup when keys are missing or invalid
    raise
