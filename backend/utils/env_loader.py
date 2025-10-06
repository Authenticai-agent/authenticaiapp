import os
from dotenv import load_dotenv


def load_database_url() -> str:
    """Load DATABASE_URL from environment or .env with safe fallback."""
    try:
        load_dotenv()
        db_url = os.getenv("DATABASE_URL")
        if db_url:
            return db_url

        # Fallback: read .env directly if present
        try:
            with open('.env', 'r') as f:
                for line in f:
                    if line.startswith('DATABASE_URL='):
                        return line.split('=', 1)[1].strip()
        except Exception:
            pass

        return ""
    except Exception:
        return ""


