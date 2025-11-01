"""
CRUD operations for database models
"""
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List
from app.db.models import Job, ErrorLog
from app.config import settings


# ==================== Job CRUD ====================

def create_job(
    db: Session,
    job_id: str,
    pub_key: str,
    image_count: int = 0,
    original_resolution: bool = False,
    iterations: int = None
) -> Job:
    """Create a new job in database"""
    # Use settings.TRAINING_ITERATIONS if not specified
    if iterations is None:
        iterations = settings.TRAINING_ITERATIONS

    job = Job(
        job_id=job_id,
        pub_key=pub_key,
        status="PENDING",
        image_count=image_count,
        original_resolution=original_resolution,
        iterations=iterations,
        created_at=datetime.utcnow()
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def get_job_by_id(db: Session, job_id: str) -> Optional[Job]:
    """Get job by job_id"""
    return db.query(Job).filter(Job.job_id == job_id).first()


def get_job_by_pub_key(db: Session, pub_key: str) -> Optional[Job]:
    """Get job by public key"""
    return db.query(Job).filter(Job.pub_key == pub_key).first()


def update_job_status(
    db: Session,
    job_id: str,
    status: str,
    error_message: Optional[str] = None,
    error_stage: Optional[str] = None
) -> Optional[Job]:
    """Update job status"""
    job = get_job_by_id(db, job_id)
    if not job:
        return None

    job.status = status

    if status == "PROCESSING" and not job.started_at:
        job.started_at = datetime.utcnow()
    elif status in ["COMPLETED", "FAILED"]:
        job.completed_at = datetime.utcnow()
        if job.started_at:
            job.processing_time_seconds = (job.completed_at - job.started_at).total_seconds()

    if error_message:
        job.error_message = error_message
    if error_stage:
        job.error_stage = error_stage

    db.commit()
    db.refresh(job)
    return job


def update_job_step(
    db: Session,
    job_id: str,
    step: str,
    progress: int
) -> Optional[Job]:
    """Update job step and progress (IMPLEMENT.md 섹션 E)"""
    job = get_job_by_id(db, job_id)
    if not job:
        return None

    job.step = step
    job.progress = progress

    db.commit()
    db.refresh(job)
    return job


def update_job_results(
    db: Session,
    job_id: str,
    colmap_registered_images: Optional[int] = None,
    colmap_points: Optional[int] = None
) -> Optional[Job]:
    """Update job results (MVP: COLMAP stats only)"""
    job = get_job_by_id(db, job_id)
    if not job:
        return None

    if colmap_registered_images is not None:
        job.colmap_registered_images = colmap_registered_images
    if colmap_points is not None:
        job.colmap_points = colmap_points

    db.commit()
    db.refresh(job)
    return job


def increment_retry_count(db: Session, job_id: str) -> Optional[Job]:
    """Increment retry count for a job"""
    job = get_job_by_id(db, job_id)
    if not job:
        return None

    job.retry_count += 1
    db.commit()
    db.refresh(job)
    return job


def get_all_jobs(db: Session, skip: int = 0, limit: int = 100) -> List[Job]:
    """Get all jobs with pagination"""
    return db.query(Job).order_by(Job.created_at.desc()).offset(skip).limit(limit).all()


def get_running_jobs(db: Session) -> List[Job]:
    """Get all running jobs"""
    return db.query(Job).filter(Job.status == "PROCESSING").all()


def get_pending_jobs(db: Session) -> List[Job]:
    """Get all pending jobs ordered by creation time"""
    return db.query(Job).filter(Job.status == "PENDING").order_by(Job.created_at.asc()).all()


def delete_job(db: Session, job_id: str) -> bool:
    """Delete a job"""
    job = get_job_by_id(db, job_id)
    if not job:
        return False

    # Delete associated error logs
    db.query(ErrorLog).filter(ErrorLog.job_id == job_id).delete()

    # Delete job
    db.delete(job)
    db.commit()
    return True


# ==================== ErrorLog CRUD ====================

def log_error(
    db: Session,
    job_id: str,
    stage: str,
    error_type: str,
    error_message: str,
    traceback: Optional[str] = None
) -> ErrorLog:
    """Log an error"""
    error_log = ErrorLog(
        job_id=job_id,
        stage=stage,
        error_type=error_type,
        error_message=error_message,
        traceback=traceback,
        timestamp=datetime.utcnow()
    )
    db.add(error_log)
    db.commit()
    db.refresh(error_log)
    return error_log


def get_recent_errors(db: Session, job_id: str, limit: int = 10) -> List[ErrorLog]:
    """Get recent errors for a job"""
    return db.query(ErrorLog).filter(
        ErrorLog.job_id == job_id
    ).order_by(
        ErrorLog.timestamp.desc()
    ).limit(limit).all()


def get_all_errors(db: Session, skip: int = 0, limit: int = 100) -> List[ErrorLog]:
    """Get all error logs with pagination"""
    return db.query(ErrorLog).order_by(ErrorLog.timestamp.desc()).offset(skip).limit(limit).all()
