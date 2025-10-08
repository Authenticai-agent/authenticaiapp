from typing import Dict, Any
from repos.users_repo import (
    get_user_id_by_email,
    get_latest_user_id_and_email,
    update_user_full_name,
    update_user_full_profile,
)
from repos.profile_repo import ensure_user_profiles_table, upsert_user_profile


def update_profile(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Update profile in Supabase if available; return standard response dict."""
    import logging
    logger = logging.getLogger("authenticai")
    
    # Log avatar info
    avatar = payload.get("avatar")
    print(f"🟢 PROFILE SERVICE: Payload keys: {list(payload.keys())}")
    if avatar:
        avatar_preview = avatar[:100] if isinstance(avatar, str) else str(avatar)[:100]
        print(f"🟢 PROFILE SERVICE: Avatar length: {len(avatar)}")
        logger.info(f"✅ Avatar FOUND in payload: {avatar_preview}... (length: {len(avatar)})")
    else:
        print(f"🟢 PROFILE SERVICE: NO AVATAR")
        logger.info("❌ NO AVATAR in payload")
    
    first_name = payload.get("first_name", "").strip()
    last_name = payload.get("last_name", "").strip()
    full_name = f"{first_name} {last_name}".strip()

    user_id = None
    user_email = payload.get("email")
    if user_email:
        user_id = get_user_id_by_email(user_email)
    if not user_id:
        latest = get_latest_user_id_and_email()
        if latest:
            user_id, user_email = latest

    rows = 0
    if user_id and full_name:
        rows = update_user_full_name(user_id, full_name)
        # Write full profile into public.users
        update_user_full_profile(user_id, payload)

    # Store entire profile payload in a JSONB table (upsert)
    if user_id and user_email:
        ensure_user_profiles_table()
        upsert_user_profile(user_id, user_email, payload)

    return {
        "status": "success",
        "message": "Profile updated successfully",
        "user_id": user_id,
        "email": user_email,
        "profile_data": {
            "first_name": first_name,
            "last_name": last_name,
            "full_name": full_name,
            "asthma_severity": payload.get("asthma_severity", "unknown"),
            "age": payload.get("age"),
            "location": payload.get("location", {}),
            "background_intelligence_enabled": True,
        },
        "database": "supabase",
        "rows_updated": rows,
    }


