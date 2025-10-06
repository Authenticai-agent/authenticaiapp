# Authenticai AI Prevention Coach

A commercial-grade AI-powered prevention coach that helps users manage asthma and allergies through voice assistants (Alexa/Google Home) and mobile apps.

## 🌟 Features

- **Daily Flareup Risk Forecasting**: ML-powered predictions based on air quality, pollen, and weather data
- **Voice Assistant Integration**: Seamless integration with Alexa and Google Home
- **Smart Home Automation**: Controls air purifiers, HVAC systems, and humidifiers based on risk levels
- **Personalized AI Coaching**: LLM-powered recommendations and educational content
- **Real-time Environmental Monitoring**: Multi-source air quality and environmental data
- **Subscription Management**: Freemium model with Stripe payment integration
- **User Profile Management**: Comprehensive health and preference tracking

## 🏗️ Architecture

### Backend (FastAPI)
- **Authentication**: JWT-based auth with Supabase
- **Data Integration**: AirNow, Breezometer, OpenAQ, OpenWeatherMap, Tomorrow.io APIs
- **ML Models**: Random Forest for flareup prediction with feature engineering
- **LLM Services**: OpenAI GPT-4o-mini and Google Gemini 1.5 Flash integration
- **Voice Integration**: Alexa Skills Kit handlers and Google Dialogflow
- **Smart Home**: Device management and automation triggers
- **Payments**: Stripe subscription management with webhooks

### Frontend (React + TypeScript)
- **Authentication**: Context-based auth with protected routes
- **Dashboard**: Risk scores, air quality summaries, daily briefings
- **Profile Management**: Location, health data, and preferences
- **Air Quality Monitoring**: Real-time data with historical charts
- **Predictions**: 7-day forecasts with risk factor analysis
- **Smart Home Control**: Device management and automation
- **Subscription**: Plan selection and payment processing

### AI/ML Components
- **Prediction Model**: Time-series flareup risk forecasting
- **LLM Coaching**: Conversational AI for health education
- **Feature Engineering**: Environmental and user data processing
- **Risk Analysis**: Multi-factor risk assessment and recommendations

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Supabase account
- Required API keys (see Environment Setup)

### Local Development

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd Authenticai_software_coach
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Fill in your API keys and configuration
   ```

3. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

5. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Environment Variables

### Backend (.env)
```bash
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# Authentication
JWT_SECRET=your_jwt_secret
JWT_ALGORITHM=HS256

# AI Services
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_gemini_key

# Environmental Data APIs
AIRNOW_API_KEY=your_airnow_key
OPENWEATHER_API_KEY=your_openweather_key
BREEZOMETER_API_KEY=your_breezometer_key
POLLEN_API_KEY=your_pollen_key

# Payments
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Voice Assistants
ALEXA_SKILL_ID=your_alexa_skill_id
GOOGLE_PROJECT_ID=your_google_project_id

# Cache
REDIS_URL=redis://localhost:6379
```

### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_51Q8k6vaugBlaMheeqsrQQoc_2XaGM9HrfBCV14dlo7A5ARSvTNCEiDKyOcA4l0zpkfvvcTNwQA
```

## 📊 Data Sources

- **Air Quality**: AirNow (EPA), Breezometer, OpenAQ
- **Weather**: OpenWeatherMap (current & forecast)
- **Pollen**: Tomorrow.io, Breezometer pollen APIs
- **User Data**: Symptom check-ins, device sensors, preferences

## 💰 Subscription Plans

| Feature | Free | Premium ($9.99/mo) | Enterprise ($29.99/mo) |
|---------|------|-------------------|------------------------|
| Predictions | 5/month | Unlimited | Unlimited |
| Coaching Sessions | 10/month | Unlimited | Unlimited |
| Smart Devices | 1 | 10 | Unlimited |
| Proactive Notifications | ❌ | ✅ | ✅ |
| Multi-location | ❌ | ❌ | ✅ |
| Team Management | ❌ | ❌ | ✅ |

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI 0.104+
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis
- **ML**: scikit-learn, TensorFlow
- **AI**: OpenAI GPT-4o-mini, Google Gemini 1.5 Flash
- **Payments**: Stripe
- **Voice**: Alexa Skills Kit, Google Dialogflow

### Frontend
- **Framework**: React 18 + TypeScript
- **Routing**: React Router v6
- **Styling**: TailwindCSS + Headless UI
- **Charts**: Recharts
- **HTTP**: Axios
- **Payments**: Stripe React SDK
- **Notifications**: React Hot Toast

### DevOps
- **Containerization**: Docker + Docker Compose
- **Deployment**: Railway (backend), Netlify (frontend)
- **Monitoring**: Health checks, logging
- **CI/CD**: GitHub Actions (optional)

## 📱 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/auth/me` - Current user

### Air Quality
- `GET /api/v1/air-quality/current` - Current AQI data
- `GET /api/v1/air-quality/forecast` - AQI forecast
- `GET /api/v1/air-quality/history` - Historical data

### Predictions
- `GET /api/v1/predictions/risk` - Current flareup risk
- `GET /api/v1/predictions/forecast` - 7-day forecast
- `GET /api/v1/predictions/history` - Prediction history

### Coaching
- `POST /api/v1/coaching/query` - Voice/text query
- `GET /api/v1/coaching/briefing` - Daily briefing
- `GET /api/v1/coaching/education` - Educational content

### Smart Home
- `GET /api/v1/smart-home/devices` - List devices
- `POST /api/v1/smart-home/devices` - Add device
- `POST /api/v1/smart-home/control` - Control device

### Payments
- `GET /api/payments/plans` - Available plans
- `POST /api/payments/subscribe` - Create subscription
- `DELETE /api/payments/cancel` - Cancel subscription

## 🚀 Deployment

### Railway (Backend)
1. Connect GitHub repository
2. Set environment variables
3. Deploy using `railway.toml` configuration

### Netlify (Frontend)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Configure environment variables

### Docker Production
```bash
# Build and run with production settings
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
# Run full test suite
npm run test:integration
```

## 📈 Monitoring & Health Checks

- **Health Endpoint**: `/health` - Service health status
- **Readiness**: `/ready` - Kubernetes readiness probe
- **Liveness**: `/live` - Kubernetes liveness probe

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

Commercial License - All Rights Reserved

## 📞 Support

For technical support or business inquiries, contact the development team.

---

**Built with ❤️ for better respiratory health management**
