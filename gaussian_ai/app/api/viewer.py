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


@router.get("/v/{product_id}")
async def view_result(product_id: str):
    """
    Redirect to PlayCanvas Model Viewer with PLY file and camera position

    Args:
        product_id: Product UUID

    Returns:
        Redirect to viewer with PLY URL and camera position from first image (rotated 180°)
    """
    db = SessionLocal()
    try:
        job = crud.get_job_by_product_id(db, product_id)
        if not job:
            raise HTTPException(404, "Job not found")

        if job.status != "COMPLETED":
            raise HTTPException(400, f"Job not completed yet. Current status: {job.status}")

        # Build PLY file URL for PlayCanvas viewer
        ply_url = f"{settings.BASE_URL}/recon/pub/{product_id}/cloud.ply"

        # Get camera position from first COLMAP image (rotated 180 degrees)
        job_work_dir = Path(settings.DATA_DIR) / job.product_id / "work"
        camera_pos = get_camera_position_for_viewer(job_work_dir, rotate_180=True)

        # Build viewer URL with camera position
        if camera_pos:
            x, y, z = camera_pos
            viewer_url = f"/viewer/?load={ply_url}&cameraPosition={x:.3f},{y:.3f},{z:.3f}"
            logger.info(f"Viewer URL for {product_id}: {viewer_url} (camera from first image, rotated 180°)")
        else:
            # Fallback to default view if camera position not available
            viewer_url = f"/viewer/?load={ply_url}"
            logger.warning(f"Could not read camera position for {product_id}, using default view")

        return RedirectResponse(url=viewer_url)
    finally:
        db.close()


@router.get("/v/rotate/{product_id}")
async def view_result_auto_rotate(product_id: str):
    """
    Redirect to PlayCanvas Model Viewer with auto-rotation enabled (for thumbnails)

    Features:
    - Auto-rotation at 120°/s (non-stop)
    - Input disabled (no mouse/touch interaction)
    - Perfect for product thumbnails and previews

    Args:
        product_id: Product UUID

    Returns:
        Redirect to viewer with auto-rotate enabled
    """
    db = SessionLocal()
    try:
        job = crud.get_job_by_product_id(db, product_id)
        if not job:
            raise HTTPException(404, "Job not found")

        if job.status != "COMPLETED":
            raise HTTPException(400, f"Job not completed yet. Current status: {job.status}")

        # Build PLY file URL for PlayCanvas viewer
        ply_url = f"{settings.BASE_URL}/recon/pub/{product_id}/cloud.ply"

        # Get camera position from first COLMAP image (rotated 180 degrees)
        job_work_dir = Path(settings.DATA_DIR) / job.product_id / "work"
        camera_pos = get_camera_position_for_viewer(job_work_dir, rotate_180=True)

        # Build viewer URL with auto-rotate enabled and medium quality for balanced loading
        # Set camera much farther away by multiplying camera position
        # Use quality=medium (20% points) for good quality with fast loading
        ply_url_medium = f"{ply_url}?quality=medium"

        if camera_pos:
            x, y, z = camera_pos
            # Make camera farther away
            far_x, far_y, far_z = x * 6, y * 6, z * 6
            viewer_url = f"/viewer/?load={ply_url_medium}&cameraPosition={far_x:.3f},{far_y:.3f},{far_z:.3f}&autoRotate=45&disableInput=true"
            logger.info(f"Auto-rotate viewer URL for {product_id}: {viewer_url} (120°/s, 10x camera distance, medium quality, input disabled)")
        else:
            # Fallback to default view if camera position not available
            viewer_url = f"/viewer/?load={ply_url_medium}&autoRotate=45&disableInput=true"
            logger.warning(f"Could not read camera position for {product_id}, using default view with auto-rotate")

        return RedirectResponse(url=viewer_url)
    finally:
        db.close()
