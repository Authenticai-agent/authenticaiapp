"""
Setup Admin User Script
Creates admin user: jura@authenticai.ai with password: admin1234
"""

import os
import sys
from passlib.context import CryptContext
from database import get_admin_db
from datetime import datetime

# Use argon2 for password hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def setup_admin_user():
    """Create or update admin user in database"""
    
    admin_email = "jura@authenticai.ai"
    admin_password = "admin1234"
    
    print(f"Setting up admin user: {admin_email}")
    
    # Hash the password
    hashed_password = pwd_context.hash(admin_password)
    print(f"Password hashed successfully")
    
    # Get database connection
    db = get_admin_db()
    
    try:
        # Check if user already exists
        existing_user = db.table('users').select('*').eq('email', admin_email).execute()
        
        if existing_user.data and len(existing_user.data) > 0:
            # Update existing user
            user_id = existing_user.data[0]['id']
            print(f"User exists with ID: {user_id}. Updating password...")
            
            result = db.table('users').update({
                'hashed_password': hashed_password
            }).eq('id', user_id).execute()
            
            print(f"✅ Admin user updated successfully!")
            print(f"   Email: {admin_email}")
            print(f"   Password: {admin_password}")
            
        else:
            # Create new user
            print("User doesn't exist. Creating new admin user...")
            
            result = db.table('users').insert({
                'email': admin_email,
                'hashed_password': hashed_password,
                'full_name': 'Jura Admin',
                'subscription_tier': 'premium'
            }).execute()
            
            if result.data and len(result.data) > 0:
                user_id = result.data[0]['id']
                print(f"✅ Admin user created successfully!")
                print(f"   User ID: {user_id}")
                print(f"   Email: {admin_email}")
                print(f"   Password: {admin_password}")
                print(f"   Subscription: Premium")
            else:
                print("❌ Failed to create admin user")
                return False
        
        print("\n" + "="*50)
        print("Admin Login Credentials:")
        print("="*50)
        print(f"Email:    {admin_email}")
        print(f"Password: {admin_password}")
        print("="*50)
        print("\nYou can now login to the admin dashboard at:")
        print("http://localhost:3000/admin")
        print("="*50)
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up admin user: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("="*50)
    print("AuthenticAI Admin Setup")
    print("="*50)
    print()
    
    success = setup_admin_user()
    
    if success:
        sys.exit(0)
    else:
        sys.exit(1)
