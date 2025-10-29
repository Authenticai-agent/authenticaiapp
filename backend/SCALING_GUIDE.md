# Scaling Guide for 10,000+ Concurrent Users

## Quick Start

### 1. Enable Railway Horizontal Scaling

```bash
# In Railway dashboard:
1. Go to your service settings
2. Navigate to "Scaling" tab
3. Set "Replicas" to 3-5
4. Enable "Auto-scaling" (if available)
5. Set resource limits:
   - Memory: 2GB per instance
   - CPU: 2 cores per instance
```

### 2. Add Redis (Optional but Recommended)

```bash
# In Railway:
1. Click "New" → "Database" → "Add Redis"
2. Copy the REDIS_URL
3. Add to environment variables:
   REDIS_URL=redis://...
```

### 3. Update Environment Variables

```bash
# Required for scaling:
WORKERS=4                    # Uvicorn workers per instance
MAX_CONNECTIONS=100          # Max DB connections per worker
RATE_LIMIT_STORAGE=redis     # Use Redis for rate limiting (if available)
```

### 4. Monitor Performance

```bash
# Add monitoring service (recommended):
1. Sentry for error tracking
2. DataDog/New Relic for APM
3. Railway metrics dashboard
```

## Current Capacity

### Single Instance (Current)
- **Concurrent Users**: 100-500
- **Requests/Second**: 50-100
- **Response Time**: 200-500ms
- **Memory**: 512MB-1GB
- **Cost**: $5-20/month

### 3 Instances (Recommended)
- **Concurrent Users**: 5,000-10,000
- **Requests/Second**: 500-1000
- **Response Time**: 200-800ms
- **Memory**: 1.5-3GB total
- **Cost**: $50-100/month

### 5 Instances (High Traffic)
- **Concurrent Users**: 10,000-20,000
- **Requests/Second**: 1000-2000
- **Response Time**: 300-1000ms
- **Memory**: 2.5-5GB total
- **Cost**: $100-200/month

## Performance Optimizations Already Implemented

### ✅ Frontend
- [x] Lazy loading for routes
- [x] Static asset caching (1 year)
- [x] DNS prefetch for APIs
- [x] Preconnect hints
- [x] No source maps in production
- [x] Minified CSS/JS
- [x] Image compression

### ✅ Backend
- [x] Async/await patterns
- [x] Connection pooling (http_client.py)
- [x] Response caching (cache_service.py)
- [x] Rate limiting middleware
- [x] Security headers
- [x] CORS optimization
- [x] Health check endpoint

### ✅ Database
- [x] Supabase with connection pooling
- [x] Row-level security (RLS)
- [x] Indexed queries
- [x] Prepared statements

## Load Testing Commands

### Using Apache Bench
```bash
# Test 1000 concurrent users
ab -n 10000 -c 1000 https://your-api.railway.app/health

# Test with POST requests
ab -n 5000 -c 500 -p data.json -T application/json https://your-api.railway.app/api/v1/auth/login
```

### Using Locust
```python
# locustfile.py
from locust import HttpUser, task, between

class AuthenticaiUser(HttpUser):
    wait_time = between(1, 3)
    
    @task
    def get_air_quality(self):
        self.client.get("/api/v1/air-quality/comprehensive?lat=40.7128&lon=-74.0060")
    
    @task
    def get_dashboard(self):
        self.client.get("/api/v1/predictions/flareup-risk?lat=40.7128&lon=-74.0060")

# Run: locust -f locustfile.py --host=https://your-api.railway.app
```

## Monitoring Checklist

### Key Metrics to Track
- [ ] Response time (p50, p95, p99)
- [ ] Error rate (target: <1%)
- [ ] CPU usage (target: <70%)
- [ ] Memory usage (target: <80%)
- [ ] Database connections (target: <80% of limit)
- [ ] Cache hit rate (target: >70%)
- [ ] API rate limit hits

### Alerts to Set Up
- [ ] Response time > 2s
- [ ] Error rate > 5%
- [ ] CPU usage > 80%
- [ ] Memory usage > 90%
- [ ] Database connection pool exhausted
- [ ] Rate limit exceeded frequently

## Troubleshooting

### High Response Times
```bash
# Check:
1. Database query performance
2. External API latency
3. Cache hit rate
4. CPU/Memory usage

# Solutions:
- Add more cache
- Optimize database queries
- Increase instance count
- Add connection pooling
```

### Memory Leaks
```bash
# Check:
1. Cache size (should auto-cleanup)
2. Rate limiter memory
3. Unclosed connections

# Solutions:
- Restart instances
- Add memory limits
- Implement cache eviction
- Use Redis for rate limiting
```

### Database Connection Errors
```bash
# Check:
1. Connection pool size
2. Number of active connections
3. Query timeout settings

# Solutions:
- Increase Supabase tier
- Add connection pooling
- Optimize queries
- Add read replicas
```

## Cost Optimization

### Current Costs
- Railway: $5-20/month (1 instance)
- Supabase: Free tier
- Netlify: Free tier
- **Total**: ~$20/month

### Optimized for 10K Users
- Railway: $50-100/month (3-5 instances)
- Supabase: $25/month (Pro tier)
- Redis: $10-30/month (optional)
- Monitoring: $10/month (Sentry free tier)
- **Total**: ~$100-150/month

### Revenue Projection
- 10,000 users × $5/month = $50,000/month
- Infrastructure cost: $150/month
- **Profit margin**: 99.7%

## Next Steps

1. **Immediate** (Do Today):
   - [ ] Enable Railway horizontal scaling (3 instances)
   - [ ] Test with 1000 concurrent users
   - [ ] Monitor error rates

2. **Short-term** (This Week):
   - [ ] Add Redis for rate limiting
   - [ ] Set up monitoring (Sentry)
   - [ ] Optimize database queries
   - [ ] Add health check monitoring

3. **Long-term** (This Month):
   - [ ] Implement auto-scaling rules
   - [ ] Add load testing pipeline
   - [ ] Set up alerting
   - [ ] Document runbooks

## Support

For questions or issues:
1. Check Railway logs: `railway logs`
2. Check Supabase dashboard
3. Review cache stats: `/api/v1/monitoring/cache-stats`
4. Contact Railway support for scaling help
