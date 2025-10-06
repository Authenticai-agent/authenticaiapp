#!/bin/bash
"""
Setup script for AuthenticAI MCP Server
"""

echo "🚀 Setting up AuthenticAI MCP Server..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "mcp_venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv mcp_venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source mcp_venv/bin/activate

# Install requirements
echo "📥 Installing MCP server requirements..."
pip install --upgrade pip
pip install -r mcp_requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file..."
    cp .env.example .env 2>/dev/null || echo "BACKEND_URL=http://localhost:8000" > .env
fi

echo "✅ MCP Server setup complete!"
echo ""
echo "📋 Available commands:"
echo "  Start MCP server: python mcp_server.py"
echo "  Run tests: python -m pytest tests/"
echo "  View logs: tail -f mcp_server.log"
echo ""
echo "🔗 MCP Server Resources:"
echo "  - health://user-data - User health data"
echo "  - environment://current - Environmental data"
echo "  - predictions://personal-risk - Risk predictions"
echo "  - coaching://recommendations - Health recommendations"
echo ""
echo "🛠️ MCP Server Tools:"
echo "  - get_health_data - Get user health metrics"
echo "  - get_environmental_data - Get air quality data"
echo "  - get_risk_prediction - Get personal risk assessment"
echo "  - get_recommendations - Get health recommendations"
