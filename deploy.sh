#!/bin/bash
"""
Production Deployment Script for AuthenticAI
"""

set -e

echo "🚀 Starting AuthenticAI Production Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is required but not installed."
    exit 1
fi

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Create SSL directory
echo "🔒 Creating SSL directory..."
mkdir -p ssl

# Load environment variables
echo "⚙️ Loading environment configuration..."
if [ -f ".env.production" ]; then
    export $(grep -v '^#' .env.production | xargs)
    echo "✅ Production environment loaded"
else
    echo "⚠️ Warning: .env.production not found, using default values"
fi

# Build and start services
echo "🐳 Building and starting services..."
if command -v docker-compose &> /dev/null; then
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
else
    docker compose down
    docker compose build --no-cache
    docker compose up -d
fi

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

# Backend health check
if curl -f http://localhost:8000/api/v1/health &> /dev/null; then
    echo "✅ Backend API is healthy"
else
    echo "❌ Backend API health check failed"
    echo "📋 Checking backend logs..."
    if command -v docker-compose &> /dev/null; then
        docker-compose logs backend | tail -20
    else
        docker compose logs backend | tail -20
    fi
fi

# Frontend health check
if curl -f http://localhost:3000 &> /dev/null; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    echo "📋 Checking frontend logs..."
    if command -v docker-compose &> /dev/null; then
        docker-compose logs frontend | tail -20
    else
        docker compose logs frontend | tail -20
    fi
fi

# Database health check
if command -v docker-compose &> /dev/null; then
    if docker-compose exec -T db pg_isready -U postgres &> /dev/null; then
        echo "✅ Database is healthy"
    else
        echo "❌ Database health check failed"
    fi
else
    if docker compose exec -T db pg_isready -U postgres &> /dev/null; then
        echo "✅ Database is healthy"
    else
        echo "❌ Database health check failed"
    fi
fi

# Redis health check
if command -v docker-compose &> /dev/null; then
    if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
        echo "✅ Redis is healthy"
    else
        echo "❌ Redis health check failed"
    fi
else
    if docker compose exec -T redis redis-cli ping | grep -q PONG; then
        echo "✅ Redis is healthy"
    else
        echo "❌ Redis health check failed"
    fi
fi

echo ""
echo "🎉 Deployment Summary:"
echo "  📊 Backend API: http://localhost:8000"
echo "  🌐 Frontend: http://localhost:3000"
echo "  📝 API Documentation: http://localhost:8000/docs"
echo "  🔍 Health Check: http://localhost:8000/api/v1/health"
echo "  📊 Monitoring: http://localhost:9090 (if enabled)"
echo ""

echo "📋 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart backend: docker-compose restart backend"
echo "  View service status: docker-compose ps"
echo ""

echo "⚠️ Next Steps:"
echo "  1. Update DNS to point to your server"
echo "  2. Configure SSL certificates in ./ssl directory"
echo "  3. Update environment variables in .env.production"
echo "  4. Set up monitoring and alerting"
echo "  5. Configure backup strategies"
echo ""

echo "✅ AuthenticAI deployed successfully!"
