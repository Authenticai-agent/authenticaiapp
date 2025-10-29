#!/usr/bin/env python3
"""
Script to reset a user's password directly in the database
Usage: python reset_password.py <email> <new_password>
"""
import os
import sys
from dotenv import load_dotenv
from supabase import create_client
from passlib.context import CryptContext

# Load environment variables
load_dotenv()

# Initialize password context (same as in auth.py)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash a password using argon2"""
    return pwd_context.hash(password)

def reset_user_password(email: str, new_password: str):
    """Reset a user's password in the database"""
    
    # Get Supabase credentials
    url = os.getenv('SUPABASE_URL')
    service_key = os.getenv('SUPABASE_SERVICE_KEY')
    
    if not url or not service_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
        return False
    
    try:
        # Create Supabase admin client
        client = create_client(url, service_key)
        
        # Check if user exists
        result = client.table('users').select('id, email').eq('email', email).execute()
        
        if not result.data:
            print(f"❌ Error: User with email '{email}' not found")
            return False
        
        user = result.data[0]
        print(f"✅ Found user: {user['email']} (ID: {user['id']})")
        
        # Hash the new password
        hashed_password = get_password_hash(new_password)
        print(f"🔐 Generated password hash")
        
        # Update the password in database
        update_result = client.table('users').update({
            'hashed_password': hashed_password,
            'updated_at': 'now()'
        }).eq('email', email).execute()
        
        if update_result.data:
            print(f"✅ Password successfully updated for {email}")
            print(f"🔑 New password: {new_password}")
            return True
        else:
            print(f"❌ Error: Failed to update password")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python reset_password.py <email> <new_password>")
        print("\nExample:")
        print("  python reset_password.py europosmiskas@gmail.com NewPassword123!")
        sys.exit(1)
    
    email = sys.argv[1]
    new_password = sys.argv[2]
    
    print("=" * 80)
    print("🔐 Password Reset Tool")
    print("=" * 80)
    print(f"Email: {email}")
    print(f"New Password: {new_password}")
    print("=" * 80)
    
    # Confirm action
    confirm = input("\n⚠️  Are you sure you want to reset this password? (yes/no): ")
    if confirm.lower() != 'yes':
        print("❌ Password reset cancelled")
        sys.exit(0)
    
    print("\n🔄 Resetting password...")
    success = reset_user_password(email, new_password)
    
    if success:
        print("\n" + "=" * 80)
        print("✅ SUCCESS! User can now login with the new password")
        print("=" * 80)
        sys.exit(0)
    else:
        print("\n" + "=" * 80)
        print("❌ FAILED! Password was not reset")
        print("=" * 80)
        sys.exit(1)
