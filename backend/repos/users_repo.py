from typing import Optional, Tuple
from db.supabase_conn import get_supabase_connection
from typing import Dict, Any


def get_latest_user_id_and_email() -> Optional[Tuple[str, Optional[str]]]:
    conn = get_supabase_connection()
    if not conn:
        return None
    cur = conn.cursor()
    cur.execute("SELECT id, email FROM users ORDER BY created_at DESC LIMIT 1")
    row = cur.fetchone()
    cur.close()
    conn.close()
    return (row[0], row[1]) if row else None


def get_user_id_by_email(email: str) -> Optional[str]:
    conn = get_supabase_connection()
    if not conn:
        return None
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = %s ORDER BY created_at DESC LIMIT 1", (email,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row[0] if row else None


def update_user_full_name(user_id: str, full_name: str) -> int:
    conn = get_supabase_connection()
    if not conn:
        return 0
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE users
        SET full_name = %s
        WHERE id = %s
        """,
        (full_name, user_id),
    )
    affected = cur.rowcount
    conn.commit()
    cur.close()
    conn.close()
    return affected

def json_dump(obj: Dict[str, Any]) -> str:
    import json
    return json.dumps(obj, separators=(",", ":"))


def ensure_users_profile_columns() -> None:
    """Add flexible columns to public.users to store full profile data."""
    conn = get_supabase_connection()
    if not conn:
        return
    cur = conn.cursor()
    cur.execute(
        """
        ALTER TABLE public.users
        ADD COLUMN IF NOT EXISTS first_name text,
        ADD COLUMN IF NOT EXISTS last_name text,
        ADD COLUMN IF NOT EXISTS age integer,
        ADD COLUMN IF NOT EXISTS asthma_severity text,
        ADD COLUMN IF NOT EXISTS location_lat double precision,
        ADD COLUMN IF NOT EXISTS location_lon double precision,
        ADD COLUMN IF NOT EXISTS location_address text,
        ADD COLUMN IF NOT EXISTS allergies text[],
        ADD COLUMN IF NOT EXISTS triggers text[],
        ADD COLUMN IF NOT EXISTS health_conditions text[],
        ADD COLUMN IF NOT EXISTS medications text[],
        ADD COLUMN IF NOT EXISTS household_info jsonb,
        ADD COLUMN IF NOT EXISTS profile jsonb
        """
    )
    conn.commit()
    cur.close()
    conn.close()


def update_user_full_profile(user_id: str, payload: dict) -> int:
    conn = get_supabase_connection()
    if not conn:
        return 0
    cur = conn.cursor()
    # Prepare values
    first_name = (payload.get("first_name") or "").strip() or None
    last_name = (payload.get("last_name") or "").strip() or None
    age = payload.get("age")
    asthma = payload.get("asthma_severity")
    loc = payload.get("location") or {}
    loc_lat = loc.get("lat")
    loc_lon = loc.get("lon")
    loc_addr = loc.get("address")
    allergies = payload.get("allergies") or None
    triggers = payload.get("triggers") or None
    health_conditions = payload.get("health_conditions") or None
    medications = payload.get("medications") or None
    household = payload.get("household_info") or None
    avatar = payload.get("avatar") or None

    # Ensure columns exist
    ensure_users_profile_columns()

    print(f"🔴 REPO: Updating user {user_id} with avatar length: {len(avatar) if avatar else 0}")
    
    try:
        cur.execute(
            """
            UPDATE public.users
            SET first_name = %s,
                last_name = %s,
                age = %s,
                asthma_severity = %s,
                location_lat = %s,
                location_lon = %s,
                location_address = %s,
                allergies = %s,
                triggers = %s,
                health_conditions = %s,
                medications = %s,
                household_info = %s::jsonb,
                profile = %s::jsonb,
                avatar = %s,
                full_name = COALESCE(%s, '') || CASE WHEN %s IS NOT NULL AND %s <> '' THEN ' ' || %s ELSE '' END
            WHERE id = %s
            """,
            (
                first_name,
                last_name,
                age,
                asthma,
                loc_lat,
                loc_lon,
                loc_addr,
                allergies,
                triggers,
                health_conditions,
                medications,
                json_dump(household) if household is not None else None,
                json_dump(payload),
                avatar,
                first_name, last_name, last_name, last_name,
                user_id,
            ),
        )
        affected = cur.rowcount
        print(f"🔴 REPO: SQL executed, rows affected: {affected}")
    except Exception as e:
        print(f"🔴 REPO ERROR: {e}")
        import traceback
        traceback.print_exc()
        affected = 0
    # If no rows updated (user_id not present), try upsert by email
    if affected == 0:
        email = payload.get("email")
        if email:
            cur.execute(
                """
                INSERT INTO public.users (
                    id, email, first_name, last_name, age, asthma_severity,
                    location_lat, location_lon, location_address,
                    allergies, triggers, health_conditions, medications,
                    household_info, profile, full_name, created_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s,
                    %s, %s, %s,
                    %s, %s, %s, %s,
                    %s::jsonb, %s::jsonb,
                    COALESCE(%s,'') || CASE WHEN %s IS NOT NULL AND %s <> '' THEN ' ' || %s ELSE '' END,
                    now()
                )
                ON CONFLICT (id) DO UPDATE SET
                    email = EXCLUDED.email,
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    age = EXCLUDED.age,
                    asthma_severity = EXCLUDED.asthma_severity,
                    location_lat = EXCLUDED.location_lat,
                    location_lon = EXCLUDED.location_lon,
                    location_address = EXCLUDED.location_address,
                    allergies = EXCLUDED.allergies,
                    triggers = EXCLUDED.triggers,
                    health_conditions = EXCLUDED.health_conditions,
                    medications = EXCLUDED.medications,
                    household_info = EXCLUDED.household_info,
                    profile = EXCLUDED.profile,
                    full_name = EXCLUDED.full_name,
                    updated_at = now()
                """,
                (
                    user_id,
                    email,
                    first_name,
                    last_name,
                    age,
                    asthma,
                    loc_lat,
                    loc_lon,
                    loc_addr,
                    allergies,
                    triggers,
                    health_conditions,
                    medications,
                    json_dump(household) if household is not None else None,
                    json_dump(payload),
                    first_name, last_name, last_name, last_name,
                ),
            )
            affected = cur.rowcount
    conn.commit()
    cur.close()
    conn.close()
    return affected


