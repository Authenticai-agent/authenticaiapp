#!/usr/bin/env python3
"""
Quick script to check user data in the database
"""
import os
import sys
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in .env file")
    sys.exit(1)

email = 'virkutyte.jurate@gmail.com'

try:
    # Connect to database
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Query user
    cursor.execute("""
        SELECT 
            id, 
            email, 
            first_name, 
            last_name, 
            age, 
            asthma_severity,
            allergies,
            triggers,
            health_conditions,
            medications,
            location_lat,
            location_lon,
            location_address,
            created_at,
            updated_at
        FROM users 
        WHERE email = %s
    """, (email,))
    
    user = cursor.fetchone()
    
    if user:
        print(f"\n✅ Found user: {email}\n")
        print("=" * 80)
        for key, value in user.items():
            print(f"{key:20s}: {value}")
        print("=" * 80)
    else:
        print(f"\n❌ User not found: {email}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
