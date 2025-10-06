import psycopg2
from typing import Optional
from utils.env_loader import load_database_url


def get_supabase_connection() -> Optional["psycopg2.extensions.connection"]:
    """Return a psycopg2 connection to Supabase if DATABASE_URL is valid."""
    db_url = load_database_url()
    if not db_url or "supabase" not in db_url:
        return None
    return psycopg2.connect(db_url)


