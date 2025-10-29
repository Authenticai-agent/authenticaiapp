"""
Shared HTTP Client with Connection Pooling
Prevents connection exhaustion and improves performance
"""
import httpx
import asyncio
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class HTTPClientManager:
    """
    Singleton HTTP client manager with connection pooling
    Reuses connections across requests for better performance
    """
    
    _instance: Optional['HTTPClientManager'] = None
    _client: Optional[httpx.AsyncClient] = None
    _lock = asyncio.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    async def get_client(self) -> httpx.AsyncClient:
        """Get or create the shared HTTP client"""
        if self._client is None:
            async with self._lock:
                if self._client is None:
                    # Configure connection pooling
                    limits = httpx.Limits(
                        max_keepalive_connections=20,  # Keep 20 connections alive
                        max_connections=100,            # Max 100 total connections
                        keepalive_expiry=30.0          # Keep connections alive for 30s
                    )
                    
                    # Configure timeouts
                    timeout = httpx.Timeout(
                        connect=5.0,   # 5s to establish connection
                        read=10.0,     # 10s to read response
                        write=5.0,     # 5s to write request
                        pool=5.0       # 5s to get connection from pool
                    )
                    
                    self._client = httpx.AsyncClient(
                        limits=limits,
                        timeout=timeout,
                        http2=True,  # Enable HTTP/2 for better performance
                        follow_redirects=True
                    )
                    
                    logger.info("HTTP client initialized with connection pooling")
        
        return self._client
    
    async def close(self):
        """Close the HTTP client"""
        if self._client is not None:
            await self._client.aclose()
            self._client = None
            logger.info("HTTP client closed")

# Global instance
http_client_manager = HTTPClientManager()

async def get_http_client() -> httpx.AsyncClient:
    """Get the shared HTTP client"""
    return await http_client_manager.get_client()

async def close_http_client():
    """Close the shared HTTP client"""
    await http_client_manager.close()
