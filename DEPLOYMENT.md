# Deployment Guide

This guide covers deploying the Authenticai AI Prevention Coach to production environments.

## 🚀 Deployment Options

### Option 1: Railway (Backend) + Netlify (Frontend) - Recommended

#### Railway Backend Deployment

1. **Connect Repository**
   - Sign up at [Railway](https://railway.app)
   - Connect your GitHub repository
   - Select the backend service

2. **Configure Environment Variables**
   ```bash
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   JWT_SECRET=your_jwt_secret_key
   OPENAI_API_KEY=your_openai_key
   GOOGLE_API_KEY=your_google_gemini_key
   AIRNOW_API_KEY=your_airnow_key
   OPENWEATHER_API_KEY=your_openweather_key
   BREEZOMETER_API_KEY=your_breezometer_key
   POLLEN_API_KEY=your_pollen_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ALEXA_SKILL_ID=your_alexa_skill_id
   GOOGLE_PROJECT_ID=your_google_project_id
   REDIS_URL=redis://redis:6379
   ```

3. **Deploy**
   - Railway will automatically detect the `railway.toml` file
   - The service will build and deploy automatically
   - Note the deployed URL (e.g., `https://your-app.railway.app`)

#### Netlify Frontend Deployment

1. **Connect Repository**
   - Sign up at [Netlify](https://netlify.com)
   - Connect your GitHub repository
   - Set build directory to `frontend`

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `build`
   - Node version: `18`

3. **Environment Variables**
   ```bash
   REACT_APP_API_URL=https://your-backend.railway.app
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_51Q8k6vaugBlaMheeqsrQQoc_2XaGM9HrfBCV14dlo7A5ARSvTNCEiDKyOcA4l0zpkfvvcTNwQA
   ```

4. **Deploy**
   - Netlify will build and deploy automatically
   - Configure custom domain if needed

### Option 2: Docker Compose (Single Server)

1. **Server Requirements**
   - 4GB+ RAM
   - 2+ CPU cores
   - 50GB+ storage
   - Ubuntu 20.04+ or similar

2. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Clone and Configure**
   ```bash
   git clone <your-repo>
   cd Authenticai_software_coach
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Deploy**
   ```bash
   docker-compose up -d
   ```

5. **Setup Reverse Proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location /api {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Option 3: AWS/GCP Cloud Deployment

#### AWS ECS Deployment

1. **Create ECS Cluster**
   ```bash
   aws ecs create-cluster --cluster-name authenticai-cluster
   ```

2. **Build and Push Images**
   ```bash
   # Backend
   docker build -t authenticai-backend ./backend
   docker tag authenticai-backend:latest your-account.dkr.ecr.region.amazonaws.com/authenticai-backend:latest
   docker push your-account.dkr.ecr.region.amazonaws.com/authenticai-backend:latest
   
   # Frontend
   docker build -t authenticai-frontend ./frontend
   docker tag authenticai-frontend:latest your-account.dkr.ecr.region.amazonaws.com/authenticai-frontend:latest
   docker push your-account.dkr.ecr.region.amazonaws.com/authenticai-frontend:latest
   ```

3. **Create Task Definitions**
   - Use the provided `aws-task-definition.json`
   - Configure environment variables
   - Set up load balancers

#### Google Cloud Run

1. **Build and Deploy Backend**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT-ID/authenticai-backend ./backend
   gcloud run deploy authenticai-backend --image gcr.io/PROJECT-ID/authenticai-backend --platform managed
   ```

2. **Build and Deploy Frontend**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT-ID/authenticai-frontend ./frontend
   gcloud run deploy authenticai-frontend --image gcr.io/PROJECT-ID/authenticai-frontend --platform managed
   ```

## 🔧 Configuration

### Database Setup (Supabase)

1. **Create Project**
   - Sign up at [Supabase](https://supabase.com)
   - Create a new project
   - Note the URL and anon key

2. **Run Database Migrations**
   ```sql
   -- Run the SQL from backend/database.py
   -- This creates all necessary tables
   ```

3. **Configure Row Level Security**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE air_quality_data ENABLE ROW LEVEL SECURITY;
   -- Add policies as needed
   ```

### Redis Setup

#### Option 1: Railway Redis
- Add Redis service in Railway
- Use the provided connection URL

#### Option 2: Redis Cloud
- Sign up at [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
- Create a database
- Use the connection string

#### Option 3: Self-hosted
```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### External API Setup

1. **Air Quality APIs**
   - [AirNow](https://www.airnow.gov/index.cfm?action=aqibasics.aqi): Free EPA data
   - [Breezometer](https://breezometer.com/): Commercial air quality API
   - [OpenAQ](https://openaq.org/): Open source air quality data

2. **Weather API**
   - [OpenWeatherMap](https://openweathermap.org/api): Free tier available

3. **Pollen APIs**
   - [Tomorrow.io](https://tomorrow.io/): Weather and pollen data
   - Breezometer: Also provides pollen data

4. **AI Services**
   - [OpenAI](https://openai.com/): GPT-4o-mini for coaching
   - [Google AI](https://ai.google/): Gemini 1.5 Flash

5. **Payment Processing**
   - [Stripe](https://stripe.com/): Payment and subscription management

### Voice Assistant Setup

#### Alexa Skill

1. **Create Skill**
   - Go to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
   - Create a new skill
   - Choose "Custom" model

2. **Configure Interaction Model**
   ```json
   {
     "intents": [
       {
         "name": "AirQualityIntent",
         "samples": ["what's the air quality", "how's the air today"]
       },
       {
         "name": "RiskForecastIntent",
         "samples": ["what's my flareup risk", "am I at risk today"]
       }
     ]
   }
   ```

3. **Set Endpoint**
   - Use your deployed backend URL + `/api/v1/alexa/webhook`
   - Configure SSL certificate

#### Google Assistant

1. **Create Actions Project**
   - Go to [Actions Console](https://console.actions.google.com/)
   - Create a new project

2. **Configure Dialogflow**
   - Create intents for air quality, risk forecast, etc.
   - Set webhook to your backend URL + `/api/v1/google/webhook`

## 🔒 Security

### SSL/TLS Configuration

1. **Let's Encrypt (Free)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

2. **Cloudflare (Recommended)**
   - Add your domain to Cloudflare
   - Enable SSL/TLS encryption
   - Configure firewall rules

### Environment Security

1. **Secrets Management**
   - Use Railway/Netlify environment variables
   - Never commit secrets to git
   - Rotate API keys regularly

2. **Database Security**
   - Enable Row Level Security in Supabase
   - Use connection pooling
   - Monitor for suspicious activity

3. **API Security**
   - Implement rate limiting
   - Use CORS properly
   - Validate all inputs

## 📊 Monitoring

### Health Checks

The application includes built-in health check endpoints:
- `/health` - Overall service health
- `/ready` - Readiness probe
- `/live` - Liveness probe

### Logging

1. **Application Logs**
   ```bash
   # View Railway logs
   railway logs

   # View Docker logs
   docker-compose logs -f
   ```

2. **Error Tracking**
   - Consider integrating Sentry for error tracking
   - Set up log aggregation (ELK stack, etc.)

### Performance Monitoring

1. **Database Performance**
   - Monitor Supabase dashboard
   - Set up query performance alerts

2. **API Performance**
   - Monitor response times
   - Set up uptime monitoring

3. **Resource Usage**
   - Monitor CPU/memory usage
   - Set up scaling alerts

## 🚀 Scaling

### Horizontal Scaling

1. **Load Balancing**
   - Use Railway's built-in load balancing
   - Or configure Nginx/HAProxy

2. **Database Scaling**
   - Supabase handles scaling automatically
   - Consider read replicas for heavy workloads

3. **Caching**
   - Redis for session storage
   - CDN for static assets

### Vertical Scaling

1. **Railway**
   - Upgrade to higher-tier plans
   - Configure resource limits

2. **Docker**
   - Adjust container resource limits
   - Use multi-stage builds for smaller images

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway up

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Netlify
        run: |
          npm install -g netlify-cli
          cd frontend && npm install && npm run build
          netlify deploy --prod --dir=build --auth=${{ secrets.NETLIFY_TOKEN }}
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check Supabase URL and key
   - Verify network connectivity
   - Check RLS policies

2. **API Rate Limits**
   - Monitor API usage
   - Implement caching
   - Consider upgrading API plans

3. **Memory Issues**
   - Monitor resource usage
   - Optimize ML model loading
   - Implement request queuing

4. **SSL Certificate Issues**
   - Verify domain configuration
   - Check certificate expiration
   - Ensure proper DNS settings

### Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test API endpoints individually
4. Contact support if needed

---

This deployment guide should get your Authenticai AI Prevention Coach running in production. Choose the deployment option that best fits your needs and budget.
