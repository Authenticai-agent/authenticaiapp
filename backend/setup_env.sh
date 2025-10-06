#!/bin/bash

# Backend Configuration
echo 'BACKEND_PORT=8000' > .env
echo 'BACKEND_HOST=0.0.0.0' >> .env
echo 'BACKEND_ENVIRONMENT=development' >> .env
echo 'BACKEND_LOG_LEVEL=debug' >> .env

# Supabase Configuration
echo 'SUPABASE_URL=https://mvzedizusolvyzqddevm.supabase.co' >> .env
echo 'SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12emVkaXp1c29sbnl6cWRkZXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNDIxMTQsImV4cCI6MjA3MzgxODExNH0.YIyc7CsjXNvNjsg0br50n-R5s1U6RyqYLNJlXWC9Yy0' >> .env
echo 'SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12emVkaXp1c29sbnl6cWRkZXZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI0MjExNCwiZXhwIjoyMDczODE4MTE0fQ.aToKkCYiFiPXepI9aEB4IgP5TgjqEXr8vzVdnJ6-WXk' >> .env

# Database Configuration
echo 'DATABASE_URL=postgresql://postgres:postgres@localhost:5432/authenticai' >> .env
echo 'REDIS_URL=redis://localhost:6379' >> .env

# API Keys
echo 'OPENWEATHER_API_KEY=977ba23c8e07a995cd392197671cec8f' >> .env
echo 'AIRNOW_API_KEY=AB22CC3D-8A9C-4E08-9B6F-1AF7DAD0F961' >> .env
echo 'PURPLEAIR_API_KEY=36F61ACC-956B-11F0-BDE5-4201AC1DC121' >> .env

# JWT Configuration
echo 'JWT_SECRET=m7lWxPyLdVXg7dk61ayrxjwJGFzoIZIcxixJgeGTuaY' >> .env
echo 'JWT_ALGORITHM=HS256' >> .env
echo 'JWT_EXPIRE_MINUTES=30' >> .env

# Frontend Configuration
echo 'FRONTEND_URL=http://localhost:3000' >> .env
echo 'ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000' >> .env

# Stripe Configuration (for payments)
echo 'STRIPE_SECRET_KEY=your_stripe_secret_key_here' >> .env
echo 'STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here' >> .env
echo 'STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here' >> .env

# Email Configuration (if needed)
echo 'SMTP_SERVER=smtp.example.com' >> .env
echo 'SMTP_PORT=587' >> .env
echo 'SMTP_USERNAME=your_smtp_username' >> .env
echo 'SMTP_PASSWORD=your_smtp_password' >> .env
echo 'EMAIL_FROM=noreply@authenticai.com' >> .env

# OpenAI Configuration
echo 'OPENAI_API_KEY=your_openai_api_key_here' >> .env

# Google Gemini Configuration
echo 'GOOGLE_API_KEY=your_google_gemini_api_key_here' >> .env

echo 'Environment variables have been set in .env file.'
