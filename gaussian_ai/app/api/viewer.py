"""
Viewer page API endpoints
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from pathlib import Path

from app.config import settings
from app.db import crud
from app.db.database import SessionLocal
from app.utils.logger import setup_logger
from app.utils.colmap_reader import get_camera_position_for_viewer

logger = setup_logger(__name__)
router = APIRouter(tags=["viewer"])


@router.get("/v/{pub_key}")
async def view_result(pub_key: str):
    """
    Redirect to PlayCanvas Model Viewer with PLY file and camera position

    Args:
        pub_key: Public key

    Returns:
        Redirect to viewer with PLY URL and camera position from first image (rotated 180°)
    """
    db = SessionLocal()
    try:
        job = crud.get_job_by_pub_key(db, pub_key)
        if not job:
            raise HTTPException(404, "Job not found")

        if job.status != "COMPLETED":
            raise HTTPException(400, f"Job not completed yet. Current status: {job.status}")

        # Build PLY file URL for PlayCanvas viewer
        ply_url = f"{settings.BASE_URL}/recon/pub/{pub_key}/cloud.ply"

        # Get camera position from first COLMAP image (rotated 180 degrees)
        job_work_dir = Path(settings.DATA_DIR) / job.job_id / "work"
        camera_pos = get_camera_position_for_viewer(job_work_dir, rotate_180=True)

        # Build viewer URL with camera position
        if camera_pos:
            x, y, z = camera_pos
            viewer_url = f"/viewer/?load={ply_url}&cameraPosition={x:.3f},{y:.3f},{z:.3f}"
            logger.info(f"Viewer URL for {pub_key}: {viewer_url} (camera from first image, rotated 180°)")
        else:
            # Fallback to default view if camera position not available
            viewer_url = f"/viewer/?load={ply_url}"
            logger.warning(f"Could not read camera position for {pub_key}, using default view")

        return RedirectResponse(url=viewer_url)
    finally:
        db.close()


@router.get("/v/rotate/{pub_key}")
async def view_result_auto_rotate(pub_key: str):
    """
    Redirect to PlayCanvas Model Viewer with auto-rotation enabled (for thumbnails)

    Features:
    - Auto-rotation at 120°/s (non-stop)
    - Input disabled (no mouse/touch interaction)
    - Perfect for product thumbnails and previews

    Args:
        pub_key: Public key

    Returns:
        Redirect to viewer with auto-rotate enabled
    """
    db = SessionLocal()
    try:
        job = crud.get_job_by_pub_key(db, pub_key)
        if not job:
            raise HTTPException(404, "Job not found")

        if job.status != "COMPLETED":
            raise HTTPException(400, f"Job not completed yet. Current status: {job.status}")

        # Build PLY file URL for PlayCanvas viewer
        ply_url = f"{settings.BASE_URL}/recon/pub/{pub_key}/cloud.ply"

        # Get camera position from first COLMAP image (rotated 180 degrees)
        job_work_dir = Path(settings.DATA_DIR) / job.job_id / "work"
        camera_pos = get_camera_position_for_viewer(job_work_dir, rotate_180=True)

        # Build viewer URL with auto-rotate enabled and medium quality for balanced loading
        # Set camera much farther away by multiplying camera position
        # Use quality=medium (20% points) for good quality with fast loading
        ply_url_medium = f"{ply_url}?quality=medium"

        if camera_pos:
            x, y, z = camera_pos
            # Make camera farther away
            far_x, far_y, far_z = x * 10, y * 10, z * 10
            viewer_url = f"/viewer/?load={ply_url_medium}&cameraPosition={far_x:.3f},{far_y:.3f},{far_z:.3f}&autoRotate=120&disableInput=true"
            logger.info(f"Auto-rotate viewer URL for {pub_key}: {viewer_url} (120°/s, 10x camera distance, medium quality, input disabled)")
        else:
            # Fallback to default view if camera position not available
            viewer_url = f"/viewer/?load={ply_url_medium}&autoRotate=120&disableInput=true"
            logger.warning(f"Could not read camera position for {pub_key}, using default view with auto-rotate")

        return RedirectResponse(url=viewer_url)
    finally:
        db.close()
