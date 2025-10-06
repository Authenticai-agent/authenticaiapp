#!/usr/bin/env python3
from supabase import create_client
import os
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()

# Create admin Supabase client
admin_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase_admin = create_client(url, admin_key)

# Update the test user
try:
    result = supabase_admin.table("users").update({
        "hashed_password": hashed_password
    }).eq("email", "test@example.com").execute()

    print("Updated test user password successfully")
    print(f"New hash: {hashed_password}")

except Exception as e:
    print(f"Error updating user: {e}")
