"""
Temporary Database Setup - Use local PostgreSQL while fixing Supabase
"""

import psycopg2
import psycopg2.extras
import os
import logging
from typing import Optional
from dotenv import load_dotenv

load_dotenv()
logger = setup_logger()

class TempDatabase:
    def __init__(self):
        self.connection = None
    
    def get_connection(self):
        if self.connection is None or self.connection.closed:
            try:
                # Use local PostgreSQL
                self.connection = psycopg2.connect(
                    host="localhost",
                    port="5432",
                    user="postgres",
                    password="postgres",
                    database="authenticai"
                )
                
                # Enable JSON support
                psycopg2.extras.register_default_json(conn_or_curs=self.connection, loads=lambda x: x)
                self.connection.autocommit = False
                
                logger.info("✅ Connected to local PostgreSQL")
                
            except Exception as e:
                logger.error(f"Failed to connect to PostgreSQL: {e}")
                raise
        
        return self.connection
    
    def table(self, table_name):
        return TempTable(self, table_name)

class TempTable:
    def __init__(self, db, table_name):
        self.db = db
        self.table_name = table_name
        self._query = None
        self._conditions = []
    
    def select(self, *args):
        self._query = f"SELECT {', '.join(args) if args else '*'} FROM {self.table_name}"
        return self
    
    def eq(self, field, value):
        self._conditions.append(f"{field} = %s")
        return self
    
    def limit(self, n):
        self._query += f" LIMIT {n}"
        return self
    
    def execute(self):
        conn = self.db.get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        try:
            query = self._query
            if self._conditions:
                query += " WHERE " + " AND ".join(self._conditions)
            
            cur.execute(query)
            result = cur.fetchall()
            return {"data": result}
        finally:
            cur.close()
    
    def insert(self, data):
        conn = self.db.get_connection()
        cur = conn.cursor()
        
        try:
            columns = ', '.join(data.keys())
            values = ', '.join(['%s'] * len(data))
            query = f"INSERT INTO {self.table_name} ({columns}) VALUES ({values})"
            
            cur.execute(query, list(data.values()))
            conn.commit()
            return {"data": [{"id": cur.lastrowid}]}
        finally:
            cur.close()

# Global database instance
temp_db = TempDatabase()

def get_db():
    return temp_db

def get_admin_db():
    return temp_db

def init_temp_db():
    """Initialize temporary database"""
    conn = temp_db.get_connection()
    cur = conn.cursor()
    
    # Create users table
    cur.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        hashed_password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        subscription_tier VARCHAR(50) DEFAULT 'free',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ''')
    
    # Create test user
    cur.execute('''
    INSERT INTO users (email, hashed_password, full_name, subscription_tier) 
    VALUES (%s, %s, %s, %s)
    ON CONFLICT (email) DO NOTHING;
    ''', ('test@example.com', '$2b$12$L0duKK3FzP5E3fL4qhashedpassword123', 'Test User', 'free'))
    
    conn.commit()
    cur.close()
    logger.info("Temporary database initialized")

# Initialize on import
try:
    init_temp_db()
    logger.info("AuthenticAI temporary database ready")
except Exception as e:
    logger.error(f"Temporary database initialization failed: {e}")
