from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from utils.auth_utils import get_current_user
from database import get_db, get_admin_db
from utils.logger import setup_logger

from typing import Optional
import os
from datetime import datetime, timedelta

# Import schemas from models
from models.schemas import UserCreate, User, LoginRequest, Token, TokenData

# Import the mapping function
from routers.users import map_db_to_user_format

router = APIRouter()
security = HTTPBearer()
# Use bcrypt with truncate_error=False to avoid 72-byte limit issues
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__truncate_error=False
)
logger = setup_logger()

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "30"))

# Validate required environment variables
if not SECRET_KEY:
    raise ValueError("JWT_SECRET environment variable must be set")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash - truncate to 72 bytes for bcrypt compatibility"""
    # Apply same truncation as during hashing
    password_safe = plain_password[:50] if len(plain_password) > 50 else plain_password
    return pwd_context.verify(password_safe, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password - truncate to 72 bytes for bcrypt compatibility"""
    # Bcrypt has a 72-byte limit, so truncate if necessary
    # Truncate to 50 characters to be safe (well under 72 bytes even with UTF-8)
    password_safe = password[:50] if len(password) > 50 else password
    return pwd_context.hash(password_safe)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@router.post("/register", response_model=Token)
async def register(user: UserCreate):
    """Register a new user"""
    db = get_db()
    
    # Check if user already exists
    try:
        existing_user = db.table("users").select("email").eq("email", user.email).execute()
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    except Exception as e:
        logger.error("Error checking existing user: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user.password)
    user_data = {
        "email": user.email,
        "hashed_password": hashed_password,  # Use correct column name from actual schema
        "subscription_tier": "free"
    }
    
    # Add optional fields if they exist - map to actual database schema
    if user.first_name:
        if user.last_name:
            user_data["full_name"] = f"{user.first_name} {user.last_name}"
        else:
            user_data["full_name"] = user.first_name
    
    try:
        # Use admin client to bypass RLS for user registration
        admin_db = get_admin_db()
        logger.info("Attempting to create user with data: %s", user_data)
        result = admin_db.table("users").insert(user_data).execute()
        logger.info("Insert result: %s", result)
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user - no data returned"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except Exception as e:
        logger.error("Error creating user: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest):
    """Authenticate user and return token"""
    db = get_admin_db()  # Use admin client to bypass RLS for login
    
    try:
        result = db.table("users").select("*").eq("email", login_data.email).execute()
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        user_data = result.data[0]
        if not verify_password(login_data.password, user_data["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": login_data.email}, expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error during login: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.get("/debug/schema")
async def debug_schema():
    """Debug endpoint to check database schema"""
    try:
        admin_db = get_admin_db()
        # Try to get any existing user to see the schema
        result = admin_db.table("users").select("*").limit(1).execute()
        return {
            "table_exists": True,
            "sample_data": result.data,
            "data_count": len(result.data) if result.data else 0
        }
    except Exception as e:
        return {
            "error": str(e),
            "table_exists": False
        }

@router.post("/refresh", response_model=Token)
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh access token"""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
