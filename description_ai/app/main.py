"""
Main FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.api import inspect

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Fault Detection API",
    description="중고 물품 결함 자동 분석 API using Claude 3 Haiku",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(inspect.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Fault Detection API",
        "version": "1.0.0",
        "model": settings.CLAUDE_MODEL,
        "endpoints": {
            "analyze": "POST /inspect/analyze",
            "health": "GET /inspect/health",
            "docs": "GET /docs"
        }
    }


@app.get("/healthz")
async def healthz():
    """
    Health check endpoint for container orchestration
    """
    return "ok"


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
