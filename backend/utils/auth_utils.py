"""
Authentication utilities
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from typing import Optional
from database import get_admin_db
from utils.logger import setup_logger

# Import schemas from models
from models.schemas import TokenData, User

logger = setup_logger()

SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    db = get_admin_db()  # Use admin client to bypass RLS for user lookup
    try:
        result = db.table("users").select("*").eq("email", token_data.email).execute()
        if not result.data:
            raise credentials_exception
        user_data = result.data[0]

        # Import the mapping function
        from routers.users import map_db_to_user_format
        mapped_user_data = map_db_to_user_format(user_data)

        return User(**mapped_user_data)
    except Exception as e:
        logger.error("Error fetching user data: %s", e)
        raise credentials_exception
