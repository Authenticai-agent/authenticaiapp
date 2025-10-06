from database import get_admin_db
from utils.logger import setup_logger

logger = setup_logger()

REQUIRED_TABLES = [
    "lung_function_readings",
    "medications",
    "medication_doses",
    "biometric_readings",
    "detailed_symptoms",
    "health_goals",
    "coaching_sessions",
]

def ensure_tables_exist():
    db = get_admin_db()
    for table in REQUIRED_TABLES:
        try:
            # Try a simple select to verify existence
            db.table(table).select("id").limit(1).execute()
        except Exception as e:
            # Log but do not crash; Supabase migrations should create these
            logger.warning(f"Table missing or not accessible: {table} ({e})")


