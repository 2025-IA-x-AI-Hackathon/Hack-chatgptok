"""
Main FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.config import settings
from app.db.database import init_db
from app.api import jobs, viewer
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager

    Initialize database and run preflight checks on startup
    """
    logger.info("=" * 60)
    logger.info("Starting Gaussian Splatting API server")
    logger.info("=" * 60)

    # Run preflight check once at startup
    logger.info("Running environment preflight check...")
    from app.utils.preflight import run_preflight_check

    preflight_result = run_preflight_check()

    if preflight_result.is_fatal():
        logger.error("❌ Preflight check failed!")
        logger.error(f"\n{preflight_result.get_summary()}")
        raise RuntimeError(
            "Server environment is not ready. "
            "Please fix the issues above before starting the server."
        )

    logger.info("✅ Preflight check passed!")
    logger.info(f"\n{preflight_result.get_summary()}")
    logger.info("=" * 60)

    logger.info(f"Data directory: {settings.DATA_DIR}")
    logger.info(f"Max concurrent jobs: {settings.MAX_CONCURRENT_JOBS}")

    # Initialize database
    init_db()
    logger.info("Database initialized")

    # Create directories
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
    logger.info(f"Created data directory: {settings.DATA_DIR}")

    logger.info("=" * 60)
    logger.info("🚀 Server ready to accept requests")
    logger.info("=" * 60)

    yield

    logger.info("Shutting down Gaussian Splatting API server")


# Create FastAPI app
app = FastAPI(
    title="Gaussian Splatting 3D Reconstruction API",
    description="API for 3D reconstruction using COLMAP and Gaussian Splatting",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
static_dir = settings.BASE_DIR / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Mount PlayCanvas Model Viewer
viewer_dir = settings.BASE_DIR / "viewer"
if viewer_dir.exists():
    app.mount("/viewer", StaticFiles(directory=str(viewer_dir), html=True), name="viewer")

# Include routers
app.include_router(jobs.router)
app.include_router(viewer.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Gaussian Splatting 3D Reconstruction API",
        "version": "2.0.0",
        "endpoints": {
            "create_job": "POST /recon/jobs",
            "get_status": "GET /recon/jobs/{job_id}/status",
            "view_result": "GET /v/{pub_key}"
        }
    }


@app.get("/healthz")
async def healthz():
    """
    Kubernetes-style health check endpoint

    Returns simple "ok" text for minimal overhead.
    Used by container orchestration systems (k8s, Docker) for liveness/readiness probes.
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
