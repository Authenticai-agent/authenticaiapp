# Authenticai Health Platform

A comprehensive health monitoring platform that provides personalized air quality insights and health recommendations.

## Features

- **Dynamic Daily Briefings**: Location-aware health recommendations
- **Air Quality Monitoring**: Real-time environmental data from multiple sources
- **Personal Risk Prediction**: AI-powered health risk assessment
- **Premium Features**: Advanced analytics and personalized insights

## Tech Stack

**Backend:**
- FastAPI (Python)
- Supabase (Database)
- OpenWeather, PurpleAir APIs

**Frontend:**
- React + TypeScript
- Tailwind CSS
- Netlify deployment

## Deployment

**Backend:** Railway  
**Frontend:** Netlify

## Environment Variables

All API keys and secrets are stored in `.env` files (not tracked by git).

See `backend/setup_env.sh` for required environment variables.

## Security

- All secrets in `.env` files (gitignored)
- Industry-standard bcrypt password hashing
- JWT authentication with 30-minute expiration
- Rate limiting on all endpoints
- CORS configured for production

## License

Proprietary
