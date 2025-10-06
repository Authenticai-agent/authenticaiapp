# AuthenticAI MCP Server

A custom MCP (Model Context Protocol) server that provides AI models with access to AuthenticAI's health monitoring platform data and services.

## Features

### 📊 **Resources Available**
- **Health Data** (`health://user-data`) - User health metrics and history
- **Environmental Data** (`environment://current`) - Real-time environmental conditions
- **Risk Predictions** (`predictions://personal-risk`) - AI-powered health risk assessments
- **Health Recommendations** (`coaching://recommendations`) - Personalized coaching advice
- **Gamification Data** (`gamification://progress`) - User progress and achievements
- **Privacy Settings** (`privacy://settings`) - User privacy preferences

### 🛠️ **Tools Available**
- `get_health_data` - Get user's health data and metrics
- `get_environmental_data` - Get environmental conditions for a location
- `get_risk_prediction` - Get personal health risk prediction
- `get_recommendations` - Get personalized health recommendations
- `get_user_progress` - Get user's gamification progress
- `get_privacy_settings` - Get user's privacy settings
- `update_health_goal` - Update user's health goals
- `log_symptom` - Log a health symptom
- `get_air_quality_forecast` - Get air quality forecast

## Quick Start

### 1. Setup
```bash
chmod +x setup_mcp.sh
./setup_mcp.sh
```

### 2. Configure Environment
Edit the `.env` file:
```bash
BACKEND_URL=http://localhost:8000
API_KEY=your_api_key_here
```

### 3. Start MCP Server
```bash
source mcp_venv/bin/activate
python mcp_server.py
```

## Integration Examples

### Python Client
```python
from mcp import ClientSession
import asyncio

async def main():
    async with ClientSession() as session:
        # Get user health data
        health_data = await session.read_resource("health://user-123")

        # Get environmental data
        env_data = await session.read_resource("environment://New York")

        # Get risk prediction
        risk = await session.call_tool("get_risk_prediction", {
            "user_id": "user-123"
        })

asyncio.run(main())
```

### JavaScript Client
```javascript
import { Client } from '@modelcontextprotocol/sdk';

const client = new Client();

await client.connect();

// Get health data
const healthData = await client.readResource('health://user-123');

// Get environmental data
const envData = await client.readResource('environment://current');

// Call tools
const recommendations = await client.callTool('get_recommendations', {
    user_id: 'user-123'
});
```

## API Reference

### Resources

#### Health Data
```
URI: health://user-{user_id}
Description: User's health metrics, symptoms, and medical history
```

#### Environmental Data
```
URI: environment://{location}
Description: Air quality, weather, pollen, and environmental conditions
```

#### Risk Predictions
```
URI: predictions://personal-risk?user_id={user_id}
Description: AI-powered personal health risk assessments
```

### Tools

#### get_health_data
```json
{
    "name": "get_health_data",
    "inputSchema": {
        "type": "object",
        "properties": {
            "user_id": {"type": "string"}
        },
        "required": ["user_id"]
    }
}
```

#### get_environmental_data
```json
{
    "name": "get_environmental_data",
    "inputSchema": {
        "type": "object",
        "properties": {
            "location": {"type": "string"}
        },
        "required": ["location"]
    }
}
```

## Configuration

### Environment Variables
- `BACKEND_URL` - Backend API URL (default: http://localhost:8000)
- `API_KEY` - API key for authentication
- `LOG_LEVEL` - Logging level (DEBUG, INFO, WARNING, ERROR)
- `CACHE_TTL` - Cache time-to-live in seconds
- `RATE_LIMIT_REQUESTS` - Maximum requests per minute

### Security
- API key authentication required
- Rate limiting enabled
- CORS restrictions configured
- Input validation on all endpoints

## Development

### Running Tests
```bash
python -m pytest tests/
```

### Adding New Resources
1. Add resource to `MCP_RESOURCES` in `mcp_config.py`
2. Implement resource handler in `AuthenticAIMcpServer.list_resources()`
3. Add read logic in `AuthenticAIMcpServer.read_resource()`

### Adding New Tools
1. Add tool to `MCP_TOOLS` in `mcp_config.py`
2. Add tool definition in `AuthenticAIMcpServer.list_tools()`
3. Implement tool logic in `AuthenticAIMcpServer.call_tool()`

## Deployment

### Docker
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY mcp_requirements.txt .
RUN pip install -r mcp_requirements.txt

COPY mcp_server.py .
COPY mcp_config.py .

CMD ["python", "mcp_server.py"]
```

### Production Checklist
- [ ] Set production `BACKEND_URL`
- [ ] Configure API keys
- [ ] Set up SSL/TLS
- [ ] Configure rate limiting
- [ ] Set up monitoring
- [ ] Configure logging
- [ ] Test all endpoints

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if backend server is running
   - Verify `BACKEND_URL` in `.env`

2. **Authentication Errors**
   - Ensure `API_KEY` is set correctly
   - Check if API key has required permissions

3. **Rate Limiting**
   - Reduce request frequency
   - Check rate limit configuration

4. **Resource Not Found**
   - Verify resource URI format
   - Check if resource is implemented

### Debug Mode
Enable debug logging:
```bash
export LOG_LEVEL=DEBUG
python mcp_server.py
```

## Support

For issues and questions:
- Check the logs in `mcp_server.log`
- Verify all environment variables are set
- Ensure backend services are running
- Test individual API endpoints first

---

**AuthenticAI MCP Server v1.0.0** - Connecting AI models to real-time health and environmental data.
