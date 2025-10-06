from typing import Dict, Any
from db.supabase_conn import get_supabase_connection


def ensure_user_profiles_table() -> None:
    conn = get_supabase_connection()
    if not conn:
        return
    cur = conn.cursor()
    # Create a flexible JSONB-based profile store if it does not exist
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS public.user_profiles (
            user_id uuid PRIMARY KEY,
            email text,
            profile jsonb NOT NULL,
            updated_at timestamptz DEFAULT now()
        )
        """
    )
    conn.commit()
    cur.close()
    conn.close()


def upsert_user_profile(user_id: str, email: str, profile_payload: Dict[str, Any]) -> int:
    conn = get_supabase_connection()
    if not conn:
        return 0
    cur = conn.cursor()
    # Make sure table exists
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS public.user_profiles (
            user_id uuid PRIMARY KEY,
            email text,
            profile jsonb NOT NULL,
            updated_at timestamptz DEFAULT now()
        )
        """
    )
    # Upsert using PostgreSQL ON CONFLICT
    cur.execute(
        """
        INSERT INTO public.user_profiles (user_id, email, profile, updated_at)
        VALUES (%s, %s, %s::jsonb, now())
        ON CONFLICT (user_id)
        DO UPDATE SET email = EXCLUDED.email, profile = EXCLUDED.profile, updated_at = now()
        """,
        (user_id, email, json_dump(profile_payload)),
    )
    affected = cur.rowcount
    conn.commit()
    cur.close()
    conn.close()
    return affected


def json_dump(obj: Dict[str, Any]) -> str:
    # Small helper to avoid importing json at call sites
    import json
    return json.dumps(obj, separators=(",", ":"))


