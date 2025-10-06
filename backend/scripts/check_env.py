import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

REQUIRED = [
    "SUPABASE_URL",
    "SUPABASE_KEY",
    "JWT_SECRET",
    "OPENWEATHER_API_KEY",
    "GOOGLE_API_KEY",
]

OPTIONAL = [
    "SUPABASE_SERVICE_KEY",
    "AIRNOW_API_KEY",
    "PURPLEAIR_API_KEY",
    "OPENAI_API_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PUBLISHABLE_KEY",
]

def main():
    missing = [k for k in REQUIRED if not os.getenv(k)]
    if missing:
        print("Missing required environment variables:\n- " + "\n- ".join(missing))
        raise SystemExit(1)

    print("All required environment variables are present.")
    present_optional = [k for k in OPTIONAL if os.getenv(k)]
    if present_optional:
        print("Configured optional integrations: " + ", ".join(present_optional))

if __name__ == "__main__":
    main()