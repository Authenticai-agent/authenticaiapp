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
            print(f"User exists with ID: {user_id}. Updating...")
            
            result = db.table('users').update({
                'password_hash': hashed_password,
                'is_admin': True,
                'is_active': True,
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', user_id).execute()
            
            print(f"✅ Admin user updated successfully!")
            print(f"   Email: {admin_email}")
            print(f"   Password: {admin_password}")
            print(f"   Is Admin: True")
            
        else:
            # Create new user
            print("User doesn't exist. Creating new admin user...")
            
            result = db.table('users').insert({
                'email': admin_email,
                'password_hash': hashed_password,
                'name': 'Jura Admin',
                'is_admin': True,
                'is_active': True,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }).execute()
            
            if result.data and len(result.data) > 0:
                user_id = result.data[0]['id']
                print(f"✅ Admin user created successfully!")
                print(f"   User ID: {user_id}")
                print(f"   Email: {admin_email}")
                print(f"   Password: {admin_password}")
                print(f"   Is Admin: True")
                
                # Create user profile
                profile_result = db.table('user_profiles').insert({
                    'user_id': user_id,
                    'location': 'Admin',
                    'created_at': datetime.utcnow().isoformat()
                }).execute()
                
                print(f"✅ Admin profile created")
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
