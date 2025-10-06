# Fix the map_db_to_user_format function to work with our actual database schema
def map_db_to_user_format(db_user_data: dict) -> dict:
    """Map database user format to frontend expected format"""
    mapped_user = db_user_data.copy()
    
    # Our database has: id, email, hashed_password, full_name, subscription_tier, created_at, updated_at
    # Frontend expects: id, email, first_name, last_name, subscription_tier, created_at, updated_at
    
    # Map full_name to first_name and last_name (if it exists)
    if "full_name" in db_user_data and db_user_data["full_name"]:
        name_parts = db_user_data["full_name"].split(" ", 1)
        mapped_user["first_name"] = name_parts[0] if len(name_parts) > 0 else ""
        mapped_user["last_name"] = name_parts[1] if len(name_parts) > 1 else ""
    else:
        mapped_user["first_name"] = ""
        mapped_user["last_name"] = ""
    
    # Set default location to None since we don't store location in database yet
    mapped_user["location"] = None
    
    # Set default health fields to None since we don't store them yet
    mapped_user["allergies"] = []
    mapped_user["asthma_severity"] = None
    mapped_user["triggers"] = []
    mapped_user["household_info"] = None
    mapped_user["age"] = None
    
    return mapped_user
