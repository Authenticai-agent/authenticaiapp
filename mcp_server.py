"""
AuthenticAI MCP Server
Provides AI models with access to health data, environmental monitoring, and platform APIs
"""

import os
import asyncio
import json
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta
import httpx
from mcp import McpServer, NotificationOptions, types
from mcp.server import Server
from mcp.server.models import InitializationOptions
import mcp.server.stdio
from mcp.types import Resource, Tool, TextContent, ImageContent, EmbeddedResource

# Import your existing services
from services.air_quality_service import AirQualityService
from services.predictions_service import PredictionsService
from database import get_db_connection
from routers.auth import get_current_user

class AuthenticAIMcpServer:
    """Custom MCP server for AuthenticAI platform"""

    def __init__(self):
        self.air_quality_service = AirQualityService()
        self.predictions_service = PredictionsService()
        self.base_url = os.getenv("BACKEND_URL", "http://localhost:8000")

    async def get_user_health_data(self, user_id: str) -> Dict[str, Any]:
        """Get user's health data from database"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/v1/users/{user_id}/health-data")
                if response.status_code == 200:
                    return response.json()
                return {"error": "Failed to fetch health data"}
        except Exception as e:
            return {"error": f"Error fetching health data: {str(e)}"}

    async def get_environmental_data(self, location: str) -> Dict[str, Any]:
        """Get environmental data for a location"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/v1/air-quality/current?location={location}")
                if response.status_code == 200:
                    return response.json()
                return {"error": "Failed to fetch environmental data"}
        except Exception as e:
            return {"error": f"Error fetching environmental data: {str(e)}"}

    async def get_personal_risk_prediction(self, user_id: str) -> Dict[str, Any]:
        """Get personal risk prediction for user"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/v1/predictions/premium/personal-risk?user_id={user_id}")
                if response.status_code == 200:
                    return response.json()
                return {"error": "Failed to fetch risk prediction"}
        except Exception as e:
            return {"error": f"Error fetching risk prediction: {str(e)}"}

    async def get_health_recommendations(self, user_id: str) -> Dict[str, Any]:
        """Get personalized health recommendations"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/v1/coaching/recommendations?user_id={user_id}")
                if response.status_code == 200:
                    return response.json()
                return {"error": "Failed to fetch recommendations"}
        except Exception as e:
            return {"error": f"Error fetching recommendations: {str(e)}"}

    async def list_resources(self) -> List[Resource]:
        """List available resources"""
        return [
            Resource(
                uri="health://user-data",
                name="User Health Data",
                description="Access to user's health metrics and history",
                mimeType="application/json",
            ),
            Resource(
                uri="environment://current",
                name="Environmental Data",
                description="Real-time environmental conditions and air quality",
                mimeType="application/json",
            ),
            Resource(
                uri="predictions://personal-risk",
                name="Personal Risk Predictions",
                description="AI-powered personal health risk assessments",
                mimeType="application/json",
            ),
            Resource(
                uri="coaching://recommendations",
                name="Health Recommendations",
                description="Personalized health and wellness recommendations",
                mimeType="application/json",
            ),
        ]

    async def read_resource(self, uri: str) -> List[TextContent | ImageContent | EmbeddedResource]:
        """Read a specific resource"""
        if uri.startswith("health://"):
            user_id = uri.split("/")[-1] if "/" in uri else "current"
            data = await self.get_user_health_data(user_id)
            return [TextContent(type="text", text=json.dumps(data, indent=2))]

        elif uri.startswith("environment://"):
            location = uri.split("/")[-1] if "/" in uri else "current"
            data = await self.get_environmental_data(location)
            return [TextContent(type="text", text=json.dumps(data, indent=2))]

        elif uri.startswith("predictions://"):
            user_id = uri.split("/")[-1] if "/" in uri else "current"
            data = await self.get_personal_risk_prediction(user_id)
            return [TextContent(type="text", text=json.dumps(data, indent=2))]

        elif uri.startswith("coaching://"):
            user_id = uri.split("/")[-1] if "/" in uri else "current"
            data = await self.get_health_recommendations(user_id)
            return [TextContent(type="text", text=json.dumps(data, indent=2))]

        else:
            return [TextContent(type="text", text='{"error": "Resource not found"}')]

    async def list_tools(self) -> List[Tool]:
        """List available tools"""
        return [
            Tool(
                name="get_health_data",
                description="Get user's health data and metrics",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User ID"},
                    },
                    "required": ["user_id"],
                },
            ),
            Tool(
                name="get_environmental_data",
                description="Get environmental conditions for a location",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "location": {"type": "string", "description": "Location (city or coordinates)"},
                    },
                    "required": ["location"],
                },
            ),
            Tool(
                name="get_risk_prediction",
                description="Get personal health risk prediction",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User ID"},
                    },
                    "required": ["user_id"],
                },
            ),
            Tool(
                name="get_recommendations",
                description="Get personalized health recommendations",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User ID"},
                    },
                    "required": ["user_id"],
                },
            ),
        ]

    async def call_tool(self, name: str, arguments: Dict[str, Any]) -> List[TextContent | ImageContent | EmbeddedResource]:
        """Call a specific tool"""
        if name == "get_health_data":
            user_id = arguments.get("user_id", "current")
            data = await self.get_user_health_data(user_id)
            return [TextContent(type="text", text=json.dumps(data, indent=2))]

        elif name == "get_environmental_data":
            location = arguments.get("location", "current")
            data = await self.get_environmental_data(location)
            return [TextContent(type="text", text=json.dumps(data, indent=2))]

        elif name == "get_risk_prediction":
            user_id = arguments.get("user_id", "current")
            data = await self.get_personal_risk_prediction(user_id)
            return [TextContent(type="text", text=json.dumps(data, indent=2))]

        elif name == "get_recommendations":
            user_id = arguments.get("user_id", "current")
            data = await self.get_health_recommendations(user_id)
            return [TextContent(type="text", text=json.dumps(data, indent=2))]

        else:
            return [TextContent(type="text", text='{"error": "Tool not found"}')]

# Global server instance
server = AuthenticAIMcpServer()

async def main():
    """Main MCP server entry point"""
    # Run the server using stdio transport
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="authenticai-mcp",
                server_version="1.0.0",
                capabilities=server.get_capabilities(),
            ),
        )

if __name__ == "__main__":
    asyncio.run(main())
