"""
Job management API endpoints
"""
import asyncio
import secrets
import string
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.db import crud
from app.db.database import SessionLocal
from app.schemas.job import JobCreateResponse, JobStatusResponse, JobListResponse
from app.utils.image import validate_image_file, save_image
from app.utils.logger import setup_logger
from app.core.colmap import COLMAPPipeline
from app.core.gaussian_splatting import GaussianSplattingTrainer

logger = setup_logger(__name__)
router = APIRouter(prefix="/recon", tags=["reconstruction"])

# Job processing semaphore
job_semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_JOBS)


def get_db() -> Session:
    """Get database session"""
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()


def generate_job_id() -> str:
    """Generate 8-character alphanumeric job ID"""
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(8))


def generate_pub_key() -> str:
    """Generate 10-character alphanumeric public key"""
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(10))


@router.post("/jobs", response_model=JobCreateResponse)
async def create_job(
    files: List[UploadFile] = File(...),
    original_resolution: bool = Form(False),
    iterations: int = Form(None)
):
    """
    Create new reconstruction job

    Args:
        files: List of uploaded image files
        original_resolution: Whether to use original image resolution
        iterations: Number of training iterations (optional, defaults to settings.TRAINING_ITERATIONS)

    Returns:
        Job creation response with job_id and pub_key
    """
    # Validate image count (IMPLEMENT.md: 3~20장)
    if len(files) < settings.MIN_IMAGES:
        raise HTTPException(400, f"이미지 {settings.MIN_IMAGES}~{settings.MAX_IMAGES}장만 허용합니다. (현재: {len(files)}장)")
    if len(files) > settings.MAX_IMAGES:
        raise HTTPException(400, f"이미지 {settings.MIN_IMAGES}~{settings.MAX_IMAGES}장만 허용합니다. (현재: {len(files)}장)")

    # Validate all images and calculate total size
    total_size = 0
    for file in files:
        validate_image_file(file)
        # Read size (file pointer already at start after validate_image_file)
        content = await file.read()
        total_size += len(content)
        # Reset for later save
        await file.seek(0)

    # Check total upload size (IMPLEMENT.md: 최대 500MB)
    max_total_bytes = settings.MAX_TOTAL_SIZE_MB * 1024 * 1024
    if total_size > max_total_bytes:
        raise HTTPException(
            413,
            f"전체 업로드 크기 초과. 합계: {total_size / 1024 / 1024:.1f}MB, 최대: {settings.MAX_TOTAL_SIZE_MB}MB"
        )

    # Generate unique IDs
    job_id = generate_job_id()
    pub_key = generate_pub_key()

    # Create job directory
    job_dir = settings.DATA_DIR / job_id
    upload_dir = job_dir / "upload" / "images"
    upload_dir.mkdir(parents=True, exist_ok=True)

    logger.info(f"Created job {job_id} with {len(files)} images")

    # Save images
    for file in files:
        output_path = upload_dir / file.filename
        await save_image(file, output_path, resize=not original_resolution)

    # Create database record
    db = SessionLocal()
    try:
        crud.create_job(
            db=db,
            job_id=job_id,
            pub_key=pub_key,
            image_count=len(files),
            original_resolution=original_resolution,
            iterations=iterations
        )
        db.commit()
    finally:
        db.close()

    # Start background processing
    asyncio.create_task(process_job(job_id, original_resolution))

    return JobCreateResponse(
        job_id=job_id,
        pub_key=pub_key,
        original_resolution=original_resolution
    )


@router.get("/jobs/{job_id}/status", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """
    Get job status and logs

    Args:
        job_id: Job identifier

    Returns:
        Job status response
    """
    db = SessionLocal()
    try:
        job = crud.get_job_by_id(db, job_id)
        if not job:
            raise HTTPException(404, "Job not found")

        # Calculate queue position if PENDING
        queue_position = None
        if job.status == "PENDING":
            # Count how many jobs are ahead in the queue
            pending_jobs = crud.get_pending_jobs(db)
            for idx, pending_job in enumerate(pending_jobs):
                if pending_job.job_id == job_id:
                    queue_position = idx + 1
                    break

            # Count currently running jobs
            running_count = len(crud.get_running_jobs(db))

            # Add queue info to log
            if queue_position:
                if queue_position == 1 and running_count < settings.MAX_CONCURRENT_JOBS:
                    log_tail = [f">> [QUEUE] Job is next in queue. Starting soon..."]
                else:
                    log_tail = [
                        f">> [QUEUE] Position in queue: {queue_position}",
                        f">> [QUEUE] Currently running: {running_count}/{settings.MAX_CONCURRENT_JOBS} jobs",
                        f">> [QUEUE] Waiting for processing slot..."
                    ]
            else:
                log_tail = []
        else:
            # Read last 50 lines of log
            log_file = settings.DATA_DIR / job_id / "logs" / "process.log"
            log_tail = []
            if log_file.exists():
                with open(log_file, 'r') as f:
                    lines = f.readlines()
                    log_tail = [line.rstrip() for line in lines[-50:]]

        # Build viewer URL if completed
        viewer_url = None
        if job.status == "COMPLETED":
            viewer_url = f"{settings.BASE_URL}/v/{job.pub_key}"

        return JobStatusResponse(
            job_id=job.job_id,
            status=job.status,
            step=job.step,
            progress=job.progress,
            log_tail=log_tail,
            # Removed for MVP: gaussian_count, psnr, ssim, lpips
            viewer_url=viewer_url,
            error=job.error_message,
            created_at=job.created_at.isoformat() if job.created_at else None,
            started_at=job.started_at.isoformat() if job.started_at else None,
            completed_at=job.completed_at.isoformat() if job.completed_at else None,
            queue_position=queue_position,
            image_count=job.image_count,
            iterations=job.iterations,
            colmap_registered_images=job.colmap_registered_images,
            colmap_points=job.colmap_points,
            processing_time_seconds=job.processing_time_seconds,
            error_stage=job.error_stage
        )
    finally:
        db.close()


@router.get("/queue")
async def get_queue_status():
    """
    Get current queue status

    Returns:
        Queue information including running and pending jobs
    """
    db = SessionLocal()
    try:
        running_jobs = crud.get_running_jobs(db)
        pending_jobs = crud.get_pending_jobs(db)

        return {
            "max_concurrent": settings.MAX_CONCURRENT_JOBS,
            "running_count": len(running_jobs),
            "pending_count": len(pending_jobs),
            "running_jobs": [
                {
                    "job_id": job.job_id,
                    "created_at": job.created_at.isoformat() if job.created_at else None,
                    "started_at": job.started_at.isoformat() if job.started_at else None
                }
                for job in running_jobs
            ],
            "pending_jobs": [
                {
                    "job_id": job.job_id,
                    "position": idx + 1,
                    "created_at": job.created_at.isoformat() if job.created_at else None
                }
                for idx, job in enumerate(pending_jobs)
            ]
        }
    finally:
        db.close()


@router.get("/pub/{pub_key}/cloud.ply")
async def get_point_cloud(
    pub_key: str,
    quality: str = Query("full", regex="^(light|medium|full)$")
):
    """
    Download point cloud PLY file with quality options

    Args:
        pub_key: Public key
        quality: Quality level (light=5%, medium=20%, full=100%)
            - light: ~0.5MB, fastest loading, for thumbnails
            - medium: ~2-5MB, good quality, for list views
            - full: Original file, best quality, for detail views

    Returns:
        PLY file with requested quality level

    Examples:
        /pub/{pub_key}/cloud.ply?quality=light   # Fast thumbnail
        /pub/{pub_key}/cloud.ply?quality=medium  # List view
        /pub/{pub_key}/cloud.ply?quality=full    # Detail view (default)
    """
    db = SessionLocal()
    try:
        job = crud.get_job_by_pub_key(db, pub_key)
        if not job:
            raise HTTPException(404, "Job not found")

        if job.status != "COMPLETED":
            raise HTTPException(400, "Job not completed yet")

        # Get iteration from job record (support custom iterations)
        iterations = job.iterations if job.iterations else settings.TRAINING_ITERATIONS

        # Determine base filename based on quality
        if quality == "light":
            base_filename = "point_cloud_filtered_light.ply"
            fallback_filename = "point_cloud_light.ply"
        elif quality == "medium":
            base_filename = "point_cloud_filtered_medium.ply"
            fallback_filename = "point_cloud_medium.ply"
        else:  # full
            base_filename = "point_cloud_filtered.ply"
            fallback_filename = "point_cloud.ply"

        # Build file path with iterations support
        iteration_dir = settings.DATA_DIR / job.job_id / "output" / "point_cloud" / f"iteration_{iterations}"
        ply_file = iteration_dir / base_filename

        if not ply_file.exists():
            # Fallback to alternate name
            ply_file = iteration_dir / fallback_filename

        if not ply_file.exists():
            # If lightweight version not found, fall back to full quality
            if quality != "full":
                logger.warning(f"Lightweight version '{quality}' not found for {pub_key}, serving full quality")
                return await get_point_cloud(pub_key, quality="full")
            else:
                raise HTTPException(404, "Point cloud file not found")

        # Get file size for logging
        file_size_mb = ply_file.stat().st_size / (1024 * 1024)
        logger.info(f"Serving PLY file for {pub_key}: {ply_file.name} ({file_size_mb:.2f} MB, quality={quality})")

        return FileResponse(
            path=str(ply_file),
            media_type="application/octet-stream",
            filename="point_cloud.ply",
            headers={
                "Cache-Control": "public, max-age=86400",  # Cache for 1 day
                "Content-Disposition": "inline; filename=point_cloud.ply"
            }
        )
    finally:
        db.close()


@router.get("/pub/{pub_key}/scene.splat", deprecated=True)
async def get_splat_file(pub_key: str):
    """
    [DEPRECATED] Splat format is no longer supported.

    PlayCanvas viewer uses PLY format. Use `/recon/pub/{pub_key}/cloud.ply` instead.

    Args:
        pub_key: Public key

    Returns:
        HTTP 410 Gone
    """
    raise HTTPException(
        status_code=410,
        detail="Splat format is no longer supported. Use /recon/pub/{pub_key}/cloud.ply instead. PlayCanvas viewer uses PLY format."
    )


async def process_job(job_id: str, original_resolution: bool):
    """
    Background job processing pipeline with step tracking

    Args:
        job_id: Job identifier
        original_resolution: Whether to use original resolution
    """
    async with job_semaphore:
        db = SessionLocal()
        job_dir = settings.DATA_DIR / job_id
        log_dir = job_dir / "logs"
        log_dir.mkdir(parents=True, exist_ok=True)
        log_file_path = log_dir / "process.log"

        try:
            # Update status to PROCESSING
            crud.update_job_status(db, job_id, "PROCESSING")
            # Preflight step removed - now runs once at server startup
            crud.update_job_step(db, job_id, "COLMAP_FEAT", 15)
            db.commit()

            with open(log_file_path, 'w') as log_file:
                log_file.write(f">> [Job {job_id}] Starting reconstruction pipeline\n")
                log_file.flush()

                # Preflight check moved to server startup (see app/main.py)
                # This saves 1-2 seconds per job

                # Initialize COLMAP pipeline
                colmap = COLMAPPipeline(job_dir)

                # Step 1: Feature extraction
                crud.update_job_step(db, job_id, "COLMAP_FEAT", 15)
                db.commit()
                log_file.write(">> [COLMAP_FEAT] Extracting features...\n")
                log_file.flush()
                colmap.database_path.parent.mkdir(parents=True, exist_ok=True)
                await colmap.extract_features(log_file)

                # Step 2: Feature matching
                crud.update_job_step(db, job_id, "COLMAP_MATCH", 30)
                db.commit()
                log_file.write(">> [COLMAP_MATCH] Matching features...\n")
                log_file.flush()
                await colmap.match_features(log_file)

                # Step 3: Sparse reconstruction
                crud.update_job_step(db, job_id, "COLMAP_MAP", 45)
                db.commit()
                log_file.write(">> [COLMAP_MAP] Reconstructing sparse model...\n")
                log_file.flush()
                model_path = await colmap.reconstruct(log_file)

                # Step 4: Undistort images
                crud.update_job_step(db, job_id, "COLMAP_UNDIST", 55)
                db.commit()
                log_file.write(">> [COLMAP_UNDIST] Undistorting images...\n")
                log_file.flush()
                work_dir = await colmap.undistort_images(model_path, log_file)

                # Step 5: Convert to text format
                log_file.write(">> [COLMAP] Converting to text format...\n")
                log_file.flush()
                await colmap.convert_to_text(work_dir / "sparse" / "0", log_file)

                # Train/test split removed - not needed without evaluation
                # Saves 5-10 seconds and disk space

                # Step 5.5: Validate COLMAP reconstruction quality
                crud.update_job_step(db, job_id, "COLMAP_VALIDATE", 60)
                db.commit()
                log_file.write(">> [COLMAP_VALIDATE] Validating reconstruction quality...\n")
                log_file.flush()

                from app.utils.colmap_validator import simple_validation

                validation_result = simple_validation(work_dir / "sparse" / "0")
                log_file.write(validation_result.get_summary() + "\n")
                log_file.flush()

                if not validation_result.is_valid:
                    error_msg = "COLMAP reconstruction quality is insufficient for training. " + "; ".join(validation_result.errors)
                    raise RuntimeError(error_msg)

                log_file.write(">> [COLMAP_VALIDATE] Reconstruction quality is acceptable, proceeding to training...\n")
                log_file.flush()

                # Step 6: Gaussian Splatting training
                crud.update_job_step(db, job_id, "GS_TRAIN", 65)
                db.commit()
                log_file.write(">> [GS_TRAIN] Starting Gaussian Splatting training...\n")
                log_file.flush()

                output_dir = job_dir / "output"
                gs_trainer = GaussianSplattingTrainer(work_dir, output_dir)

                # Get iterations from job record
                job_record = crud.get_job_by_id(db, job_id)
                iterations = job_record.iterations if job_record else settings.TRAINING_ITERATIONS

                iteration_dir = await gs_trainer.train(log_file, iterations=iterations)

                # Evaluation removed - saves 30-60s per job
                # Users can judge quality directly in 3D viewer

                # Step 7: Post-processing
                crud.update_job_step(db, job_id, "EXPORT_PLY", 95)
                db.commit()
                log_file.write(">> [EXPORT_PLY] Post-processing results...\n")
                log_file.flush()
                gs_trainer.post_process(iteration_dir, log_file)

                # Count Gaussians (no filtered version anymore)
                ply_file = iteration_dir / "point_cloud.ply"

                gaussian_count = 0
                if ply_file.exists():
                    with open(ply_file, 'rb') as f:
                        for line in f:
                            line_str = line.decode('utf-8', errors='ignore')
                            if line_str.startswith("element vertex"):
                                gaussian_count = int(line_str.split()[-1])
                                break

                # Generate lightweight versions for faster loading
                log_file.write(">> [OPTIMIZE] Creating lightweight PLY versions...\n")
                log_file.flush()

                from app.utils.ply_downsampler import create_lightweight_versions

                lightweight_results = create_lightweight_versions(
                    original_ply_path=ply_file,
                    create_light=True,   # 5% for thumbnails
                    create_medium=True   # 20% for list views
                )

                # Log results
                if lightweight_results.get('light'):
                    light_size = lightweight_results['light'].stat().st_size / (1024 * 1024)
                    log_file.write(f">> [OPTIMIZE] Light version created: {light_size:.2f}MB\n")
                    log_file.flush()

                if lightweight_results.get('medium'):
                    medium_size = lightweight_results['medium'].stat().st_size / (1024 * 1024)
                    log_file.write(f">> [OPTIMIZE] Medium version created: {medium_size:.2f}MB\n")
                    log_file.flush()

                # Update job as completed
                crud.update_job_status(db, job_id, "COMPLETED")
                crud.update_job_step(db, job_id, "DONE", 100)
                db.commit()

                # Log completion
                success_msg = f">> [SUCCESS] Job completed! Generated {gaussian_count} Gaussians"
                log_file.write(success_msg + "\n")
                log_file.flush()
                logger.info(f"Job {job_id} completed successfully")

        except Exception as e:
            logger.error(f"Job {job_id} failed: {str(e)}")

            # Log error to database
            crud.log_error(
                db, job_id,
                stage="PIPELINE",
                error_type=type(e).__name__,
                error_message=str(e)
            )
            crud.update_job_status(
                db, job_id, "FAILED",
                error_message=str(e)
            )
            crud.update_job_step(db, job_id, "ERROR", 0)
            db.commit()

            # Write to log file
            if log_file_path.exists():
                with open(log_file_path, 'a') as log_file:
                    log_file.write(f"\n>> [ERROR] {str(e)}\n")
        finally:
            db.close()
